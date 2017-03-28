const JET_DATA = {
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
    ],
};

const N = 256;

export const getColourMap = name => {
    switch (name) {
        case 'jet':
            return getColourMapRgbaValues(JET_DATA, N);
        default:
            {
                const white = [1, 1, 1, 1];
                const black = [0, 0, 0, 1];
                return Array(255).fill(white).concat([black]);
            }
    }
};

const getColourMapRgbaValues = (data, n) => {
    const rs = makeMappingArray(n, data.red);
    const gs = makeMappingArray(n, data.green);
    const bs = makeMappingArray(n, data.blue);
    return rsgsbsToColourValues(n, rs, gs, bs);
};

const rsgsbsToColourValues = (n, rs, gs, bs) => {
    const values = Array(n);
    for (let i = 0; i < n; i++) {
        values[i] = [rs[i], gs[i], bs[i], 1];
    }
    return values;
};

const makeMappingArray = (n, adata) => {

    let x = adata.map(e => e[0]);
    const y0 = adata.map(e => e[1]);
    const y1 = adata.map(e => e[2]);

    x = x.map(v => v * (n - 1));

    const lut = new Array(n).fill(0);

    const xind = Array.from(Array(n).keys());

    let ind = searchSorted(x, xind);
    ind = ind.slice(1, ind.length - 1);

    const distance = Array.from(Array(n - 2).keys())
        .map(i => {
            const numerator = xind[i + 1] - x[ind[i] - 1];
            const denominator = x[ind[i]] - x[ind[i] - 1];
            return numerator / denominator;
        });

    Array.from(Array(n - 2).keys()).forEach(i =>
        lut[i + 1] = distance[i] * (y0[ind[i]] - y1[ind[i] - 1]) + y1[ind[i] - 1]);

    lut[0] = y1[0];

    lut[n - 1] = y0[y0.length - 1];

    return lut.map(clipZeroToOne);
};

const searchSorted = (arr, vs) => {
    const result = Array(vs.length);
    const arrLen = arr.length;
    for (let i = 0; i < vs.length; i++) {
        const v = vs[i];
        let added = false;
        for (let j = 0; j < arrLen; j++) {
            if (v <= arr[j]) {
                result[i] = j;
                added = true;
                break;
            }
        }
        if (!added) result[i] = arrLen;
    }
    return result;
};

const makeMappingArray2 = (n, lambda) =>
    linearSpaced(n, 0, 1)
        .map(lambda)
        .map(clipZeroToOne);

const linearSpaced = (length, start, stop) => {
    const step = (stop - start) / (length - 1);
    const data = Array(length);
    for (let i = 0; i < data.length; i++) {
        data[i] = start + i * step;
    }
    data[data.length - 1] = stop;
    return data;
};

const clipZeroToOne = v => clip(0, 1, v);

const clip = (min, max, v) => v < min ? min : v > max ? max : v;
