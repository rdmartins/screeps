import { controlPopulation } from './population';

import { upgrade } from './upgrader';

const controlPopulationOptions = {
    roleMinimum: {
        Upgrader: 1
    }
};

function run(): void {
    for (const creepName in Game.creeps) {
        const creep = Game.creeps[creepName];

        switch (creep.memory.role) {
        case CreepRole.Upgrader:
            upgrade(creep);
            break;
        default:
            console.log(`Creep ${creep.name} have no role.`);
            break;
        }
    }
}

export function loop(): void {
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        controlPopulation(room, controlPopulationOptions);
    }
    run();
}
