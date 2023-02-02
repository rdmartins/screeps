import { harvest } from './harvester';

export function upgrade(creep: Creep):void {
    const controller = creep.room.controller;

    switch (creep.memory.mode) {
    case CreepMode.Working:
        if (creep.upgradeController(controller) < 0) {
            creep.moveTo(controller.pos);
        }
        break;
    case CreepMode.Harvesting:
        harvest(creep);
        break;

    default:
        console.log(`Creep ${creep.name} have no mode.`);
        break;
    }

    if (creep.store[RESOURCE_ENERGY] <= 0) {
        creep.memory.mode = CreepMode.Harvesting;
    }
}
