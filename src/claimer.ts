/**
 * Build a new claimer.
 * @param {StructureSpawn} spawn - Where to spawn.
 * @param {string} roomName - What room to claim.
 */
function construct(spawn: StructureSpawn, roomName: string) {
  const totalEnergy = spawn.room.energyAvailable;
  const multiplier = Math.floor(totalEnergy / 650);

  // Only build the biggest possible
  // if (multiplier < Math.floor(spawn.room.energyCapacityAvailable / 650)) {
  //   return;
  // }

  const parts: BodyPartConstant[] = [];
  for (let i = 0; i < multiplier; i += 1) {
    parts.push(CLAIM, MOVE);
  }

  spawn.spawnCreep(parts, `claimer-x${multiplier}-${Game.time}`, {
    memory: {
      role: CreepRole.Claimer,
      targetName: roomName
    },
  });
}

/**
 * Go to target room and claim the Controller.
 * @param {Creep} creep - The creep to run the role.
 */
export function run(creep: Creep): void {
  if (creep.memory.target) {
    const room = Game.rooms[creep.memory.target];

    if (creep.room === room) {
      const { controller } = creep.room;

      if (controller) {
        let claim = creep.claimController(controller);

        if (claim === ERR_GCL_NOT_ENOUGH) {
          claim = creep.reserveController(controller);
        }

        if (claim === ERR_NOT_IN_RANGE) {
          creep.moveTo(controller, { visualizePathStyle: {} });
        }
      }
    }
  } else {
    if (creep.memory.targetName) {
      const pos = new RoomPosition(25, 25, creep.memory.targetName);
      creep.moveTo(pos, { visualizePathStyle: {} });
    } else {
      creep.say('No target.');
    }
  }
}

/**
 * Control claimers population.
 * @param  {StructureSpawn} spawn - Where to spawn from.
 * @param  {string} roomName - What room to attack.
 * @param  {int} maxPopulation
 */
export function controlPopulation(spawn: StructureSpawn, roomName: string, maxPopulation: number): void {
  const claimers = _.filter(Game.creeps, (creep: Creep) => creep.memory.role === 'claimer');

  if (claimers.length < maxPopulation) {
    construct(spawn, roomName);
  }
}
