function createIndexedVectors(vectors: Array<number>, indices: Array<number>): Array<number>{
    let indexedVectors = new Array<number>();
    for (let currentIndex: number = 0; currentIndex < indices.length; currentIndex++){
        let vectorPointer = indices[currentIndex] * 3;
        indexedVectors.push(vectors[vectorPointer]);
        indexedVectors.push(vectors[vectorPointer + 1]);
        indexedVectors.push(vectors[vectorPointer + 2]);
    }
    return indexedVectors;
}

function createIndexedColours(colours: Array<number>, indices: Array<number>): Array<number>{
    let indexedColours = new Array<number>();
    for (let currentIndex: number = 0; currentIndex < indices.length; currentIndex++){
        let colourPointer = indices[currentIndex] * 3;
        indexedColours.push(colours[colourPointer]);
        indexedColours.push(colours[colourPointer + 1]);
        indexedColours.push(colours[colourPointer + 2]);
        indexedColours.push(colours[colourPointer + 3]);
    }
    return indexedColours;
}

export {createIndexedVectors, createIndexedColours}