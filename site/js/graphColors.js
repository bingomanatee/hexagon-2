import chroma from 'chroma-js';

export const DEN_COLOR_1 = chroma(255, 51, 102);

export const DEN_2_BRACKET = 0.25;
export const DEN_COLOR_2 = chroma(25, 255, 153);

export const DEN_3_BRACKET = 0.5;
export const DEN_COLOR_3 = chroma(51, 102, 255);

export const DEN_4_BRACKET = 0.75;
export const DEN_COLOR_4 = chroma(102, 153, 255);

export const BILLION_STARS_PER_GALAXY = 100;
export const AVERAGE_DEN = 651;

export const SECTOR_LINE_COLOR = chroma(80, 80, 70);

export const MAX_STARS_PER_SECTOR = BILLION_STARS_PER_GALAXY / AVERAGE_DEN;
