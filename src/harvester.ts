/**
 * Find a new source by criteria.
 * @param  {Creep} creep - The creep to find a new target for.
 * @param  {SearchCriteria} criteria
 * Criteria to search the new target.
 *
 * `ClosestByPath`: Find an object with the shortest path from the given position.
 * `ClosestByRange`: Find an object with the shortest linear distance from the given position.
 */
function findNewTarget(creep: Creep, criteria: SearchCriteria) {
  let source: StructureContainer | Source | null;

  switch (criteria) {
    case SearchCriteria.ClosestByPath:
      source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 50,
      }) as StructureContainer;
      break;
    case SearchCriteria.ClosestByRange:
      source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 50,
      }) as StructureContainer;
      break;
    default:
      [source] = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 50,
      }) as StructureContainer[];
  }

  if (!source) {
    switch (criteria) {
      case SearchCriteria.ClosestByPath:
        source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        break;
      case SearchCriteria.ClosestByRange:
        source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        break;
      default:
        [source] = creep.room.find(FIND_SOURCES_ACTIVE);
    }
  }

  if (source) {
    creep.memory.target = source.id;
  } else {
    delete creep.memory.mode;
    delete creep.memory.target;
  }
}

/**
 * Harvest energy.
 * @param  {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep) {
  const criteria = SearchCriteria.ClosestByPath;
  let target: Source | StructureContainer | null;
  let returnCode: ScreepsReturnCode = 0;

  if (creep.memory.target) {
    target = Game.getObjectById(creep.memory.target);
    if (target) {
      if ('structureType' in target) {
        if (target.structureType === STRUCTURE_CONTAINER) {
          if (target.store[RESOURCE_ENERGY] > 50) {
            returnCode = creep.withdraw(target, RESOURCE_ENERGY);
          } else { // Stucture with low energy
            findNewTarget(creep, criteria);
          }
        } else { // target.structureType != STRUCTURE_CONTAINER
          findNewTarget(creep, criteria);
        }
      } else { // Not a structure
        returnCode = creep.harvest(target);
      }
      if (returnCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#f8df6a' } });
      }
    } else { // No target
      findNewTarget(creep, criteria);
    }
  } else { // No creep.memory.target
    findNewTarget(creep, criteria);
  }

  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    delete creep.memory.mode;
    delete creep.memory.target;
  } else {
    findNewTarget(creep, criteria);
  }
}
