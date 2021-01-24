import { run as upgrade } from './upgrader';
import { run as harvest } from './harvester';

/**
 * Find a new structure by criteria.
 * @param  {Creep} creep - The creep to find a new target for.
 * @param  {SearchCriteria} criteria
 * Criteria to search the new target.
 *
 * `ClosestByPath`: Find an object with the shortest path from the given position.
 * `ClosestByRange`: Find an object with the shortest linear distance from the given position.
 * @param  {Number} threshold - The percentual to filter the targets.
 */
function findNewTarget(creep: Creep, criteria: SearchCriteria, threshold = 0.7) {
  let structure: AnyStructure | null;

  switch (criteria) {
    case SearchCriteria.ClosestByPath:
      structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax * threshold
      });
      break;
    case SearchCriteria.ClosestByRange:
      structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax * threshold
      });
      break;
    case SearchCriteria.MostNeeded:
      [structure] = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax * threshold
      }).sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
      break;
    default:
      [structure] = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax * threshold
      });
      break;
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
 * Repair a structure.
 * @param {Creep} creep - The creep that will repair.
 */
const repair = (creep: Creep) => {
  const criteria = SearchCriteria.MostNeeded;
  const threshold = 0.7;

  if (creep.memory.target) {
    const target: AnyStructure | null = Game.getObjectById(creep.memory.target);

    if (target) {
      if (creep.repair(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#418341' } });
      } else {
        if (target.hits === target.hitsMax) {
          findNewTarget(creep, criteria, threshold);
        }
      }
    }
  } else {
    findNewTarget(creep, criteria, threshold);
  }

  if (creep.store[RESOURCE_ENERGY] === 0) {
    delete creep.memory.target;
    creep.memory.mode = CreepMode.Harvest;
  }
};

/**
 * Repair a structure
 * @param {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep): void {
  switch (creep.memory.mode) {
    case CreepMode.Harvest:
      harvest(creep);
      break;
    case CreepMode.Repair:
      repair(creep);
      break;
    default:
      repair(creep);
  }
}
