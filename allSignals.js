export function getSignalName(index) {
    return { name: allSignals[index], type: index < 70 ? "virtual" : null };
}
export function getTypeByName(name) {
    return allSignals.indexOf(name) < 69 ? "virtual" : null;
}
export const allSignals = [
    "signal-0",
    "signal-1",
    "signal-2",
    "signal-3",
    "signal-4",
    "signal-5",
    "signal-6",
    "signal-7",
    "signal-8",
    "signal-9",
    "signal-A",
    "signal-B",
    "signal-C",
    "signal-D",
    "signal-E",
    "signal-F",
    "signal-G",
    "signal-H",
    "signal-I",
    "signal-J",
    "signal-K",
    "signal-L",
    "signal-M",
    "signal-N",
    "signal-O",
    "signal-P",
    "signal-Q",
    "signal-R",
    "signal-S",
    "signal-T",
    "signal-U",
    "signal-V",
    "signal-W",
    "signal-X",
    "signal-Y",
    "signal-Z",
    "signal-red",
    // "signal-green",
    "signal-blue",
    "signal-yellow",
    "signal-pink",
    "signal-cyan",
    "signal-white",
    "signal-grey",
    "signal-black",
    "signal-check",
    "signal-deny",
    "signal-info",
    "signal-dot",
    "shape-vertical",
    "shape-horizontal",
    "shape-diagonal",
    "shape-curve",
    "shape-cross",
    "shape-diagonal-cross",
    "shape-corner",
    "shape-t",
    "shape-circle",
    "up-arrow",
    "up-right-arrow",
    "right-arrow",
    "down-right-arrow",
    "down-arrow",
    "down-left-arrow",
    "left-arrow",
    "up-left-arrow",
    "signal-stack-size",
    "signal-heart",
    "signal-skull",
    "signal-ghost",
    "wooden-chest",
    "iron-chest",
    "steel-chest",
    "storage-tank",
    "transport-belt",
    "fast-transport-belt",
    "express-transport-belt",
    "turbo-transport-belt",
    "underground-belt",
    "fast-underground-belt",
    "express-underground-belt",
    "turbo-underground-belt",
    "splitter",
    "fast-splitter",
    "express-splitter",
    "turbo-splitter",
    "burner-inserter",
    "inserter",
    "long-handed-inserter",
    "fast-inserter",
    "bulk-inserter",
    "stack-inserter",
    "small-electric-pole",
    "medium-electric-pole",
    "big-electric-pole",
    "substation",
    "pipe",
    "pipe-to-ground",
    // "casting-pipe",
    // "casting-pipe-to-ground",
    "pump",
    "rail",
    "rail-ramp",
    "rail-support",
    "train-stop",
    "rail-signal",
    "rail-chain-signal",
    "locomotive",
    "cargo-wagon",
    "fluid-wagon",
    "artillery-wagon",
    "car",
    "tank",
    "spidertron",
    "logistic-robot",
    "construction-robot",
    "active-provider-chest",
    "passive-provider-chest",
    "storage-chest",
    "buffer-chest",
    "requester-chest",
    "roboport",
    "small-lamp",
    "arithmetic-combinator",
    "decider-combinator",
    "selector-combinator",
    "constant-combinator",
    "power-switch",
    "programmable-speaker",
    "display-panel",
    "stone-brick",
    "concrete",
    "hazard-concrete",
    "refined-concrete",
    "refined-hazard-concrete",
    "landfill",
    "artificial-yumako-soil",
    "overgrowth-yumako-soil",
    "artificial-jellynut-soil",
    "overgrowth-jellynut-soil",
    "ice-platform",
    "foundation",
    "cliff-explosives",
    "repair-pack",
    "blueprint",
    "deconstruction-planner",
    "upgrade-planner",
    "blueprint-book",
    "boiler",
    "steam-engine",
    "solar-panel",
    "accumulator",
    "nuclear-reactor",
    "heat-pipe",
    "heat-exchanger",
    "steam-turbine",
    "fusion-reactor",
    "fusion-generator",
    "burner-mining-drill",
    "electric-mining-drill",
    "big-mining-drill",
    "offshore-pump",
    "pumpjack",
    "stone-furnace",
    "steel-furnace",
    "electric-furnace",
    "foundry",
    "recycler",
    "agricultural-tower",
    "biochamber",
    "captive-biter-spawner",
    "assembling-machine-1",
    "assembling-machine-2",
    "assembling-machine-3",
    "oil-refinery",
    "chemical-plant",
    "centrifuge",
    "electromagnetic-plant",
    "cryogenic-plant",
    "lab",
    "biolab",
    "lightning-rod",
    "lightning-collector",
    "heating-tower",
    "beacon",
    "speed-module",
    "speed-module-2",
    "speed-module-3",
    "efficiency-module",
    "efficiency-module-2",
    "efficiency-module-3",
    "productivity-module",
    "productivity-module-2",
    "productivity-module-3",
    "quality-module",
    "quality-module-2",
    "quality-module-3",
    // "basic-oil-processing",
    // "advanced-oil-processing",
    // "simple-coal-liquefaction",
    // "coal-liquefaction",
    // "heavy-oil-cracking",
    "light-oil-cracking",
    "solid-fuel-from-petroleum-gas",
    // "solid-fuel-from-light-oil",
    // "solid-fuel-from-heavy-oil",
    "acid-neutralisation",
    // "steam-condensation",
    "ice-melting",
    "wood",
    "coal",
    "stone",
    "iron-ore",
    "copper-ore",
    "uranium-ore",
    "raw-fish",
    "ice",
    "iron-plate",
    "copper-plate",
    "steel-plate",
    "solid-fuel",
    "plastic-bar",
    "sulfur",
    "battery",
    "explosives",
    "carbon",
    // "coal-synthesis",
    "water-barrel",
    "crude-oil-barrel",
    "petroleum-gas-barrel",
    "light-oil-barrel",
    "heavy-oil-barrel",
    "lubricant-barrel",
    "sulfuric-acid-barrel",
    "fluoroketone-hot-barrel",
    "fluoroketone-cold-barrel",
    "water-barrel",
    "crude-oil-barrel",
    "petroleum-gas-barrel",
    "light-oil-barrel",
    "heavy-oil-barrel",
    "lubricant-barrel",
    "sulfuric-acid-barrel",
    "fluoroketone-hot-barrel",
    "fluoroketone-cold-barrel",
    "empty-water-barrel",
    "empty-crude-oil-barrel",
    "empty-petroleum-gas-barrel",
    "empty-light-oil-barrel",
    "empty-heavy-oil-barrel",
    "empty-lubricant-barrel",
    "empty-sulfuric-acid-barrel",
    "empty-fluoroketone-hot-barrel",
    "empty-fluoroketone-cold-barrel",
    "iron-gear-wheel",
    "iron-stick",
    "copper-cable",
    "barrel",
    "electronic-circuit",
    "advanced-circuit",
    "processing-unit",
    "engine-unit",
    "electric-engine-unit",
    "flying-robot-frame",
    "low-density-structure",
    "rocket-fuel",
    "rocket-part",
    "uranium-processing",
    "uranium-235",
    "uranium-238",
    "uranium-fuel-cell",
    "depleted-uranium-fuel-cell",
    "nuclear-fuel-reprocessing",
    "kovarex-enrichment-process",
    "nuclear-fuel",
    "calcite",
    "molten-iron-from-lava",
    "molten-copper-from-lava",
    "molten-iron",
    "molten-copper",
    "casting-iron",
    "casting-copper",
    "casting-steel",
    "casting-iron-gear-wheel",
    "casting-iron-stick",
    "casting-low-density-structure",
    "concrete-from-molten-iron",
    "casting-copper-cable",
    "tungsten-ore",
    "tungsten-carbide",
    "tungsten-plate",
    "scrap",
    "scrap-recycling",
    "holmium-ore",
    "holmium-plate",
    "superconductor",
    "supercapacitor",
    "yumako-processing",
    "yumako-seed",
    "jellynut-processing",
    "jellynut-seed",
    "tree-seed",
    "yumako",
    "jellynut",
    "iron-bacteria",
    "copper-bacteria",
    "nutrients-from-spoilage",
    "spoilage",
    "nutrients-from-yumako-mash",
    "nutrients",
    "nutrients-from-bioflux",
    "iron-bacteria-cultivation",
    "copper-bacteria-cultivation",
    "bioflux",
    "yumako-mash",
    "jelly",
    "rocket-fuel-from-jelly",
    "biolubricant",
    "bioplastic",
    "biosulfur",
    "carbon-fiber",
    "burnt-spoilage",
    "biter-egg",
    "pentapod-egg",
    "wood-processing",
    "fish-breeding",
    "nutrients-from-fish",
    "nutrients-from-biter-egg",
    "ammoniacal-solution-separation",
    "solid-fuel-from-ammonia",
    "ammonia-rocket-fuel",
    "fluoroketone-cooling",
    "lithium",
    "lithium-plate",
    "quantum-processor",
    "fusion-power-cell",
    "automation-science-pack",
    "logistic-science-pack",
    "military-science-pack",
    "chemical-science-pack",
    "production-science-pack",
    "utility-science-pack",
    "space-science-pack",
    "metallurgic-science-pack",
    "electromagnetic-science-pack",
    "agricultural-science-pack",
    "cryogenic-science-pack",
    "promethium-science-pack",
    "rocket-silo",
    "cargo-landing-pad",
    "cargo-pod",
    "cargo-pod-container",
    "space-platform-foundation",
    "cargo-bay",
    "asteroid-collector",
    "crusher",
    "thruster",
    "space-platform-starter-pack",
    "small-metallic-asteroid",
    "medium-metallic-asteroid",
    "big-metallic-asteroid",
    "huge-metallic-asteroid",
    "small-carbonic-asteroid",
    "medium-carbonic-asteroid",
    "big-carbonic-asteroid",
    "huge-carbonic-asteroid",
    "small-oxide-asteroid",
    "medium-oxide-asteroid",
    "big-oxide-asteroid",
    "huge-oxide-asteroid",
    "small-promethium-asteroid",
    "medium-promethium-asteroid",
    "big-promethium-asteroid",
    "huge-promethium-asteroid",
    "metallic-asteroid-chunk",
    "carbonic-asteroid-chunk",
    "oxide-asteroid-chunk",
    "promethium-asteroid-chunk",
    "metallic-asteroid-crushing",
    "metallic-asteroid-reprocessing",
    "carbonic-asteroid-crushing",
    "carbonic-asteroid-reprocessing",
    "oxide-asteroid-crushing",
    "oxide-asteroid-reprocessing",
    "advanced-metallic-asteroid-crushing",
    "advanced-carbonic-asteroid-crushing",
    "advanced-oxide-asteroid-crushing",
    "advanced-thruster-fuel",
    "advanced-thruster-oxidizer",
    "nauvis",
    "vulcanus",
    "gleba",
    "fulgora",
    "aquilo",
    "solar-system-edge",
    "shattered-planet",
    "pistol",
    "submachine-gun",
    "railgun",
    "teslagun",
    "shotgun",
    "combat-shotgun",
    "rocket-launcher",
    "flamethrower",
    "firearm-magazine",
    "piercing-rounds-magazine",
    "uranium-rounds-magazine",
    "shotgun-shell",
    "piercing-shotgun-shell",
    "cannon-shell",
    "explosive-cannon-shell",
    "uranium-cannon-shell",
    "explosive-uranium-cannon-shell",
    "artillery-shell",
    "rocket",
    "explosive-rocket",
    "atomic-bomb",
    "capture-robot-rocket",
    "flamethrower-ammo",
    "railgun-ammo",
    "tesla-ammo",
    "grenade",
    "cluster-grenade",
    "poison-capsule",
    "slowdown-capsule",
    "defender-capsule",
    "defender",
    "distractor",
    "destroyer",
    "distractor-capsule",
    "destroyer-capsule",
    "light-armor",
    "heavy-armor",
    "modular-armor",
    "power-armor",
    "power-armor-mk2",
    "mech-armor",
    "solar-panel-equipment",
    "fission-reactor-equipment",
    "fusion-reactor-equipment",
    "battery-equipment",
    "battery-mk2-equipment",
    "battery-mk3-equipment",
    "belt-immunity-equipment",
    "exoskeleton-equipment",
    "personal-roboport-equipment",
    "personal-roboport-mk2-equipment",
    "night-vision-equipment",
    "toolbelt-equipment",
    "energy-shield-equipment",
    "energy-shield-mk2-equipment",
    "personal-laser-defense-equipment",
    "discharge-defense-equipment",
    "stone-wall",
    "gate",
    "radar",
    "land-mine",
    "gun-turret",
    "laser-turret",
    "flamethrower-turret",
    "artillery-turret",
    "rocket-turret",
    "tesla-turret",
    "railgun-turret",
    "water",
    "steam",
    "crude-oil",
    "petroleum-gas",
    "light-oil",
    "heavy-oil",
    "lubricant",
    "sulfuric-acid",
    "thruster-fuel",
    "thruster-oxidizer",
    "lava",
    "molten-iron",
    "molten-copper",
    "holmium-solution",
    "electrolyte",
    "ammoniacal-solution",
    "ammonia",
    "fluorine",
    "fluoroketone-hot",
    "fluoroketone-cold",
    "lithium-brine",
    "fusion-plasma",
    "small-biter",
    "medium-biter",
    "big-biter",
    "behemoth-biter",
    "small-spitter",
    "medium-spitter",
    "big-spitter",
    "behemoth-spitter",
    "small-worm-turret",
    "medium-worm-turret",
    "big-worm-turret",
    "behemoth-worm-turret",
    "biter-spawner",
    "spitter-spawner",
    "small-wriggler-pentapod",
    "small-wriggler-pentapod-premature",
    "medium-wriggler-pentapod",
    "medium-wriggler-pentapod-premature",
    "big-wriggler-pentapod",
    "big-wriggler-pentapod-premature",
    "small-strafer-pentapod",
    "medium-strafer-pentapod",
    "big-strafer-pentapod",
    "small-stomper-pentapod",
    "medium-stomper-pentapod",
    "big-stomper-pentapod",
    "gleba-spawner",
    "gleba-spawner-small",
    "small-demolisher",
    "medium-demolisher",
    "big-demolisher",
    "cliff",
    "cliff-fulgora",
    "cliff-gleba",
    "cliff-vulcanus",
    "crater-cliff",
    "character",
    "slipstack",
    "funneltrunk",
    "hairyclubnub",
    "teflilly",
    "stingfrond",
    "boompuff",
    "cuttlepop",
    "big-sand-rock",
    "copper-stromatolite",
    "iron-stromatolite",
    "huge-rock",
    "big-stomper-shell",
    "big-volcanic-rock",
    "medium-stomper-shell",
    "small-stomper-shell",
    "huge-volcanic-rock",
    "vulcanus-chimney-short",
    "vulcanus-chimney-truncated",
    "vulcanus-chimney",
    "vulcanus-chimney-cold",
    "vulcanus-chimney-faded",
    "fulgurite",
    "fulgurite-small",
    "big-fulgora-rock",
    "fulgoran-ruin-small",
    "fulgoran-ruin-medium",
    "fulgoran-ruin-stonehenge",
    "fulgoran-ruin-big",
    "fulgoran-ruin-colossal",
    "fulgoran-ruin-huge",
    "fulgoran-ruin-vault",
    "fulgoran-ruin-attractor",
    "lithium-iceberg-big",
    "lithium-iceberg-huge",
    "small-demolisher-corpse",
    "medium-demolisher-corpse",
    "big-demolisher-corpse",
    "crude-oil",
    "lithium-brine",
    "sulfuric-acid-geyser",
    "fluorine-vent",
    "lightning",
    "normal",
    "uncommon",
    "rare",
    "epic",
    "legendary",
    "signal-any-quality",
    "copper-wire",
    "green-wire",
    "red-wire",
    "spidertron-remote",
    "discharge-defense-remote",
    "artillery-targeting-remote",
    "entity-ghost",
    "item-on-ground",
    "item-request-proxy",
    "tile-ghost",
    "wube-logo-space-platform"
];
