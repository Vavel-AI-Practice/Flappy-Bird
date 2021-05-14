export class Layer {
    public size: number;
    public neurons: number[];
    public biases: number[];
    public weights: number[][];

    constructor(size: number, nextSize: number) {
        this.size = size;
        this.neurons = new Array(size);
        this.biases = new Array(size);
        this.weights = new Array(size).fill(null).map(x => new Array(nextSize));
    }

    public fillFromAnotherLayer(layer: Layer) {
        this.size = layer.size;
        this.neurons = [...layer.neurons];
        this.biases = [...layer.biases];
        this.weights = Array(layer.weights.length).fill(null).map((x, index) => [...layer.weights[index]]);

        return this;
    }
}