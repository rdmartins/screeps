import { run as upgrade } from './upgrader';
import { run as harvest } from './harvester';

/**
 * Find a new construction site by criteria
 * @param  {Creep} creep - The creep to find a new target for.
 * @param  {SearchCriteria} criteria
 * Criteria to search the new target.
 *
 * `ClosestByPath`: Find an object with the shortest path from the given position.
 * `ClosestByRange`: Find an object with the shortest linear distance from the given position.
 */
function findNewTarget(creep: Creep, criteria: SearchCriteria) {
  let constructionSite: ConstructionSite;

  switch (criteria) {
    case SearchCriteria.ClosestByPath:
      constructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite;
      break;
    case SearchCriteria.ClosestByRange:
      constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite;
      break;
    default:
      [constructionSite] = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
  }

  /* No target? Go upgrade! */
  if (constructionSite) {
    creep.memory.target = constructionSite.id;
  } else {
    delete creep.memory.target;
    upgrade(creep);
  }
}

/**
 * Build a structure.
 * @param  {Creep} creep - The creep which will build.
 */
const build = (creep: Creep) => {
  const criteria = SearchCriteria.ClosestByPath;

  if (creep.memory.target) {
    const target: ConstructionSite | null = Game.getObjectById(creep.memory.target);

    if (target) {
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#3f51b5' } });
      }
    }
  } else {
    findNewTarget(creep, criteria);
  }

  if (creep.store[RESOURCE_ENERGY] === 0) {
    delete creep.memory.target;
    creep.memory.mode = CreepMode.Harvest;
  }
};

/**
 * Build a structure
 * @param {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep): void {
  switch (creep.memory.mode) {
    case CreepMode.Harvest:
      harvest(creep);
      break;
    case CreepMode.Build:
      build(creep);
      break;
    default:
      build(creep);
  }
}
