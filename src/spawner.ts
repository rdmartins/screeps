import { construct as constructExtractor } from './extractor';

export interface Options {
  noWait: boolean
  bodyCap: number
}
export interface Population {
  maxBuilders: number
  maxExtractors: number
  maxStorers: number
  maxRepairers: number
  maxUpgraders: number
}

/* BODYPART_COST:
 * "move": 50,
 * "work": 100,
 * "attack": 80,
 * "carry": 50,
 * "heal": 250,
 * "ranged_attack": 150,
 * "tough": 10,
 * "claim": 600
 */

/**
 * Build a new worker
 * @param  {StructureSpawn} spawn - Where to spawn
 * @param  {CreepRole} role - Creep's role
 * @param  {Options} options
 */
function construct(spawn: StructureSpawn, role: CreepRole, options: Options) {
  const totalEnergy = spawn.room.energyAvailable;
  const body: BodyPartConstant[] = [];
  let multiplier = Math.floor(totalEnergy / 250);

  /* If noWait is false, wait for the biggest creep possible
   * Else, contruct creeps as soon as possible
   */
  if (!options.noWait) {
    if (multiplier < Math.floor(spawn.room.energyCapacityAvailable / 250)) {
      return;
    }
  }

  /* Cap multiplier */
  if (options.bodyCap) {
    multiplier = multiplier > options.bodyCap ? options.bodyCap : multiplier;
  }

  if (multiplier > 0) {
    for (let i = 0; i < multiplier; i += 1) {
      body.push(WORK, CARRY, MOVE, MOVE);
    }
  }

  spawn.spawnCreep(body, `${role}-x${multiplier}-${Game.time}`, { memory: { role } });
}

/**
 * Control room population
 * @param  {Room} room - What room to control
 * @param  {Population} population - Population of each creep's role
 * @param  {Options} options
 */
export function controlRoomPopulation(room: Room, population: Population, options: Options) {
  let totalCreeps = 0;
  Object.values(population).forEach((x) => {
    totalCreeps += x;
  });

  room.find(FIND_MY_SPAWNS).forEach((spawn) => {
    let aliveCreeps = 0;
    const builders: Creep[] = [];
    const extractors: Creep[] = [];
    const storers: Creep[] = [];
    const repairers: Creep[] = [];
    const upgraders: Creep[] = [];

    room.find(FIND_MY_CREEPS).forEach((creep) => {
      switch (creep.memory.role) {
        case CreepRole.Extractor:
          extractors.push(creep);
          aliveCreeps += 1;
          break;
        case CreepRole.Storer:
          storers.push(creep);
          aliveCreeps += 1;
          break;
        case CreepRole.Upgrader:
          upgraders.push(creep);
          aliveCreeps += 1;
          break;
        case CreepRole.Builder:
          builders.push(creep);
          aliveCreeps += 1;
          break;
        case CreepRole.Repairer:
          repairers.push(creep);
          aliveCreeps += 1;
          break;
        default:
      }
    });

    /* Never be without a storer */
    if (storers.length === 0) {
      const options: Options = {
        noWait: true,
        bodyCap: 0
      }
      construct(spawn, CreepRole.Storer, options);
    }

    if (aliveCreeps > totalCreeps) {
      if (extractors.length > population.maxExtractors) {
        extractors.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
        extractors[0].suicide();
      }
      if (storers.length > population.maxStorers) {
        storers.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
        storers[0].suicide();
      }
      if (upgraders.length > population.maxUpgraders) {
        upgraders.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
        upgraders[0].suicide();
      }
      if (builders.length > population.maxBuilders) {
        builders.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
        builders[0].suicide();
      }
      if (repairers.length > population.maxRepairers) {
        repairers.sort((a, b) => a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY]);
        repairers[0].suicide();
      }
    }

    if (storers.length < population.maxStorers) {
      construct(spawn, CreepRole.Storer, options);
    }
    if (upgraders.length < population.maxUpgraders) {
      construct(spawn, CreepRole.Upgrader, options);
    }
    if (builders.length < population.maxBuilders) {
      construct(spawn, CreepRole.Builder, options);
    }
    if (repairers.length < population.maxRepairers) {
      construct(spawn, CreepRole.Repairer, options);
    }
    if (extractors.length < population.maxExtractors) {
      constructExtractor(3, spawn);
    }

    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];

      spawn.room.visual.text(
        `🛠️ ${spawningCreep.memory.role} (${spawningCreep.body.length})`,
        spawn.pos.x + 1,
        spawn.pos.y,
        {
          align: 'left',
          opacity: 0.8,
        },
      );
    }
  });
}
