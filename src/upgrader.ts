import { run as harvest } from './harvester';

/**
 * Update the room's controller.
 * @param {Creep} creep - the creep that will upgrade.
 */
const upgradeController = (creep: Creep) => {
  const controller = creep.room.controller;

  if (controller) {
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }
  }

  if (creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.mode = CreepMode.Harvest;
  }
};

/**
 * Upgrade room's controller.
 * @param {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep) {
  switch (creep.memory.mode) {
    case CreepMode.Harvest:
      harvest(creep);
      break;
    case CreepMode.Upgrade:
      upgradeController(creep);
      break;
    default:
      upgradeController(creep);
  }
}
