import { run as upgrade } from './upgrader';
import { run as harvest } from './harvester';

type FilteredStructure =
  | StructureExtension
  | StructureSpawn
  | StructureLink
  | StructureTower;

/**
 * Checks if structure is of filtered type
 * @param {AnyStructure} structure 
 */
function getFilteredStructure(id: Id<AnyStructure>) {
  const structure = (Game.getObjectById(id));

  if (structure == null)
    return null;

  switch (structure.structureType) {
    case STRUCTURE_EXTENSION:
    case STRUCTURE_SPAWN:
    case STRUCTURE_LINK:
    case STRUCTURE_TOWER:
      return structure;
    default:
      return null;
  }
}

/**
 * Find a new structure by criteria.
 * @param  {Creep} creep - The creep to find a new target for.
 * @param  {SearchCriteria} criteria
 * Criteria to search the new target.
 *
 * `ClosestByPath`: Find an object with the shortest path from the given position.
 * `ClosestByRange`: Find an object with the shortest linear distance from the given position.
 */
function findNewTarget(creep: Creep, criteria: SearchCriteria) {
  let structure: FilteredStructure | null;

  switch (criteria) {
    case SearchCriteria.ClosestByPath:
      structure = (creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (
          (s.structureType === STRUCTURE_EXTENSION
            || s.structureType === STRUCTURE_SPAWN
            || s.structureType === STRUCTURE_LINK
            || s.structureType === STRUCTURE_TOWER)
          && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        ),
      }) as FilteredStructure);
      break;
    case SearchCriteria.ClosestByRange:
      structure = (creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (s) => (
          (s.structureType === STRUCTURE_EXTENSION
            || s.structureType === STRUCTURE_SPAWN
            || s.structureType === STRUCTURE_LINK
            || s.structureType === STRUCTURE_TOWER)
          && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        ),
      }) as FilteredStructure);
      break;
    default:
      [structure] = (creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => (
          (s.structureType === STRUCTURE_EXTENSION
            || s.structureType === STRUCTURE_SPAWN
            || s.structureType === STRUCTURE_LINK
            || s.structureType === STRUCTURE_TOWER)
          && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        ),
      }) as FilteredStructure[]);
  }

  /* No target? Go upgrade! */
  if (structure) {
    creep.memory.target = structure.id;
  } else {
    delete creep.memory.target;
    upgrade(creep);
  }
}

/**
 * Store energy in a structure.
 * @param  {Creep} creep - The creep with energy to store.
 */
const store = (creep: Creep) => {
  const criteria = SearchCriteria.ClosestByPath;
  let target: FilteredStructure | null;

  if (creep.memory.target) {
    target = getFilteredStructure(creep.memory.target);
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: {} });
      } else { // ERR_NOT_IN_RANGE
        if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          findNewTarget(creep, criteria);
        }
      }
    } else { // No target
      findNewTarget(creep, criteria);
    }
  } else { // No creep.memory.target
    findNewTarget(creep, criteria);
  }

  if (creep.store[RESOURCE_ENERGY] === 0) {
    delete creep.memory.target;
    creep.memory.mode = CreepMode.Harvest;
  }
};

/**
 * Harvest energy from a source.
 * @param {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep): void {
  switch (creep.memory.mode) {
    case CreepMode.Harvest:
      harvest(creep);
      break;
    case CreepMode.Store:
      store(creep);
      break;
    default:
      store(creep);
  }
}
