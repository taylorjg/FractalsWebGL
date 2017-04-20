const JET_DATA = {
    usesFuncs: false,
    red: [
        [0, 0, 0],
        [0.35, 0, 0],
        [0.66, 1, 1],
        [0.89, 1, 1],
        [1, 0.5, 0.5]
    ],
    green: [
        [0, 0, 0],
        [0.125, 0, 0],
        [0.375, 1, 1],
        [0.64, 1, 1],
        [0.91, 0, 0],
        [1, 0, 0]
    ],
    blue: [
        [0, 0.5, 0.5],
        [0.11, 1, 1],
        [0.34, 1, 1],
        [0.65, 0, 0],
        [1, 0, 0]
    ]
};

const GIST_STERN_DATA = {
    usesFuncs: false,
    red: [
        [0, 0, 0],
        [0.0547, 1, 1],
        [0.250, 0.027, 0.250],
        [1, 1, 1]
    ],
    green: [
        [0, 0, 0],
        [1, 0, 0]
    ],
    blue: [
        [0, 0, 0],
        [0.5, 1, 1],
        [0.735, 0, 0],
        [1, 0, 0]
    ]
};

const gnuplotPaletteFunctions = [
    /* 0  */ x => 0,
    /* 1  */ x => 0.5,
    /* 2  */ x => 1,
    /* 3  */ x => x,
    /* 4  */ x => Math.pow(x, 2),
    /* 5  */ x => Math.pow(x, 3),
    /* 6  */ x => Math.pow(x, 4),
    /* 7  */ x => Math.sqrt(x),
    /* 8  */ x => Math.sqrt(Math.sqrt(x)),
    /* 9  */ x => Math.sin(x * Math.PI / 2),
    /* 10 */ x => Math.cos(x * Math.PI / 2),
    /* 11 */ x => Math.abs(x - 0.5),
    /* 12 */ x => Math.pow(2 * x - 1, 2),
    /* 13 */ x => Math.sin(x * Math.PI),
    /* 14 */ x => Math.abs(Math.cos(x * Math.PI)),
    /* 15 */ x => Math.sin(x * 2 * Math.PI),
    /* 16 */ x => Math.cos(x * 2 * Math.PI),
    /* 17 */ x => Math.abs(Math.sin(x * 2 * Math.PI)),
    /* 18 */ x => Math.abs(Math.cos(x * 2 * Math.PI)),
    /* 19 */ x => Math.abs(Math.sin(x * 4 * Math.PI)),
    /* 20 */ x => Math.abs(Math.cos(x * 4 * Math.PI)),
    /* 21 */ x => 3 * x,
    /* 22 */ x => 3 * x - 1,
    /* 23 */ x => 3 * x - 2,
    /* 24 */ x => Math.abs(3 * x - 1),
    /* 25 */ x => Math.abs(3 * x - 2),
    /* 26 */ x => (3 * x - 1) / 2,
    /* 27 */ x => (3 * x - 2) / 2,
    /* 28 */ x => Math.abs((3 * x - 1) / 2),
    /* 29 */ x => Math.abs((3 * x - 2) / 2),
    /* 30 */ x => x / 0.32 - 0.78125,
    /* 31 */ x => 2 * x - 0.84,
    /* 32 */ gfunc32,
    /* 33 */ x => Math.abs(2 * x - 0.5),
    /* 34 */ x => 2 * x,
    /* 35 */ x => 2 * x - 0.5,
    /* 36 */ x => 2 * x - 1
];

// https://github.com/matplotlib/matplotlib/blob/master/lib/matplotlib/_cm.py
// https://github.com/matplotlib/matplotlib/blob/master/lib/matplotlib/colors.py

// TODO: implement this!
const gfunc32 = x => {
    // ret = np.zeros(len(x))
    // m = (x < 0.25)
    // ret[m] = 4 * x[m]
    // m = (x >= 0.25) & (x < 0.92)
    // ret[m] = -2 * x[m] + 1.84
    // m = (x >= 0.92)
    // ret[m] = x[m] / 0.08 - 11.5
    // return ret
    return x;
};

const OCEAN_DATA = {
    usesFuncs: true,
    red: gnuplotPaletteFunctions[23],
    green: gnuplotPaletteFunctions[28],
    blue: gnuplotPaletteFunctions[3]
};

const RAINBOW_DATA = {
    usesFuncs: true,
    red: gnuplotPaletteFunctions[33],
    green: gnuplotPaletteFunctions[13],
    blue: gnuplotPaletteFunctions[10]
};

export const colourMapDictionary = {
    'jet': JET_DATA,
    'gist_stern': GIST_STERN_DATA,
    'ocean': OCEAN_DATA,
    'rainbow': RAINBOW_DATA
};
