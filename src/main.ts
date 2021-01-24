import { run as store } from './storer';
import { run as claim } from './claimer';
import { run as build } from './builder';
import { run as repair } from './repairer';
import { run as upgrade } from './upgrader';
import { run as extract } from './extractor';
import { AttackAndRepair } from './tower';
import * as spawner from './spawner';

/**
 * Clear dead creeps from Memory
 */
function clearMemory() {
  Object.keys(Memory.creeps).forEach((creepName) => {
    if (!Game.creeps[creepName]) {
      delete Memory.creeps[creepName];
    }
  });
}

/**
 * Control population in each room
 * @param {Room[]} rooms - Rooms to control
 */
function controlRoomsPopulation(rooms: Room[]) {
  Object.values(rooms).forEach((room) => {
    const population: spawner.Population = {
      maxBuilders: 1,
      maxExtractors: 2,
      maxStorers: 2,
      maxRepairers: 1,
      maxUpgraders: 1,
    };
    const options: spawner.Options = {
      bodyCap: 0,
      noWait: false
    };

    spawner.controlRoomPopulation(room, population, options);
    AttackAndRepair(room); // TODO: create a defense loop
  });
}

/**
 * Run all the creeps roles.
 * @param {Creep[]} creeps - All the creeps to run.
 */
function runCreeps(creeps: Creep[]) {
  Object.values(creeps).forEach((creep) => {
    switch (creep.memory.role) {
      case CreepRole.Builder:
        build(creep);
        break;
      case CreepRole.Extractor:
        extract(creep);
        break;
      case CreepRole.Storer:
        store(creep);
        break;
      case CreepRole.Upgrader:
        upgrade(creep);
        break;
      case CreepRole.Repairer:
        repair(creep);
        break;
      case CreepRole.Claimer:
        claim(creep);
        break;
      default:
        creep.say('No role.');
    }
  });
}

/* Game main loop */
export function loop(): void {
  const creeps = Game.creeps as unknown as Creep[];
  const rooms = Game.rooms as unknown as Room[];

  clearMemory();
  controlRoomsPopulation(rooms);
  runCreeps(creeps);
}
