declare interface CreepMemory {
  mode?: CreepMode
  role: CreepRole
  target?: Id<any>
  targetName?: string
  container?: Id<StructureContainer>
  source?: Id<Source>
}

declare const enum CreepMode {
  Build = 'build',
  Harvest = 'harvest',
  Repair = 'repair',
  Store = 'store',
  Upgrade = 'upgrade',
}

declare const enum CreepRole {
  Builder = 'builder',
  Claimer = 'claimer',
  Extractor = 'extractor',
  Repairer = 'repairer',
  Storer = 'storer',
  Upgrader = 'upgrader',
}