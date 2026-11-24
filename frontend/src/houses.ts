import house1 from './assets/1/house1.png';
import house12 from './assets/1/house12.png';
import house13 from './assets/1/house13.png';
import house14 from './assets/1/house14.png';
import house15 from './assets/1/house15.png';

import house2 from './assets/2/house2.png';
import house21 from './assets/2/house21.png';
import house22 from './assets/2/house22.png';
import house23 from './assets/2/house23.png';
import house24 from './assets/2/house24.png';

import house3 from './assets/3/house3.png';
import house31 from './assets/3/house31.png';
import house32 from './assets/3/house32.png';
import house33 from './assets/3/house33.png';

import house4 from './assets/4/house4.png';
import house41 from './assets/4/house41.png';
import house42 from './assets/4/house42.png';
import house43 from './assets/4/house43.png';

import house5 from './assets/5/house5.png';
import house51 from './assets/5/house51.png';
import house52 from './assets/5/house52.png';
import house53 from './assets/5/house53.png';
import house54 from './assets/5/house54.png';

import house6 from './assets/6/house6.png';
import house61 from './assets/6/house61.png';
import house62 from './assets/6/house62.png';
import house63 from './assets/6/house63.png';

export const houses = [
    { main: house1, layouts: [house12, house13, house14, house15] },
    { main: house2, layouts: [house21, house22, house23, house24] },
    { main: house3, layouts: [house31, house32, house33] },
    { main: house4, layouts: [house41, house42, house43] },
    { main: house5, layouts: [house51, house52, house53, house54] },
    { main: house6, layouts: [house61, house62, house63] },
];

export function houseFor(propertyId: string | number) {
    const number = Number(propertyId) || 1;
    return houses[(number - 1) % houses.length];
}
