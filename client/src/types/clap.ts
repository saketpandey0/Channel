export interface ClapData {
    clapCount: number;
    userClapped: boolean;
    allowClaps: boolean
}

export interface ClapState {
    [storyId: string]: ClapData;
}

export type ClapAction = 
    | { type: 'SET_CLAP_DATA'; storyId: string; data: ClapData }
    | { type: 'TOGGLE_CLAP'; storyId: string}
    | { type: 'SET_BATCH_DATA'; data: Record<string, ClapData>}
    | { type: 'UPDATE_CLAP_COUNT'; storyId: string; count: number; userClapped: boolean }


