import { Layer } from "./Layer";

export class NeuralNetwork {

    public layers: Layer[];
    private activation: (x: number) => number = (x: number) => 1 / (1 + Math.exp(-x));
    public fitness: number = 0;

    constructor([...sizes]: number[], layers: Layer[] = []) {
        if (layers.length === 0) {
            this.layers = new Array(sizes.length);
            for (let i = 0; i < sizes.length; i++) {
                let nextSize = 0;
                if (i < sizes.length - 1) nextSize = sizes[i + 1];
                this.layers[i] = new Layer(sizes[i], nextSize);
                for (let j = 0; j < sizes[i]; j++) {
                    this.layers[i].biases[j] = Math.random() * 2.0 - 1.0;
                    for (let k = 0; k < nextSize; k++) {
                        this.layers[i].weights[j][k] = Math.random() * 2.0 - 1.0;
                    }
                }
            }
        } else {
            this.layers = new Array(layers.length);
            for (let i = 0; i < layers.length; i++) {
                const toCopy = layers[i];
                this.layers[i] = new Layer(toCopy.size, toCopy.weights[0].length).fillFromAnotherLayer(toCopy);
            }
        }
    }

    public copy = () => {
        return new NeuralNetwork([], this.layers);
    }

    public feedForward(inputs: number[]): number[] {
        for (let i = 0; i < inputs.length; i++) {
            this.layers[0].neurons[i] = inputs[i];
        }

        for (let i = 1; i < this.layers.length; i++) {
            const l = this.layers[i - 1];
            const l1 = this.layers[i];
            for (let j = 0; j < l1.size; j++) {
                l1.neurons[j] = 0;
                for (let k = 0; k < l.size; k++) {
                    l1.neurons[j] += l.neurons[k] * l.weights[k][j];
                }
                l1.neurons[j] += l1.biases[j];
                l1.neurons[j] = this.activation(l1.neurons[j]);
            }
        }
        return this.layers[this.layers.length - 1].neurons;
    }
}