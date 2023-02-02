export function controlPopulation(room: Room, opts: ControlPopulationOptions): void {
    const spawns = room.find(FIND_MY_SPAWNS);

    for (const spawnId in spawns) {
        const spawn = spawns[spawnId];

        if (spawn.store[RESOURCE_ENERGY] >= 200) {

            const creeps = room.find(FIND_MY_CREEPS);
            const upgraders = (creeps.map((c: Creep) => c.memory.role == CreepRole.Upgrader)).length;

            if (upgraders < opts.roleMinimum.Upgrader) {
                const id = (new Date()).getTime();
                spawn.spawnCreep([WORK, WORK, CARRY, MOVE], `Upgrader${id}`,
                    {
                        memory: {
                            role: CreepRole.Upgrader,
                            mode: CreepMode.Harvesting
                        }
                    });
            } else {
                const id = (new Date()).getTime();
                spawn.spawnCreep([WORK, WORK, CARRY, MOVE], `Upgrader${id}`,
                    {
                        memory: {
                            role: CreepRole.Upgrader,
                            mode: CreepMode.Harvesting
                        }
                    });
            }
        }
    }
}

declare interface ControlPopulationOptions {
    roleMinimum: RoleMinimum
}

declare interface RoleMinimum {
    Upgrader: number
}
