import { config } from "../config";
import { NeuralNetwork } from "../models/NeuralNetwork";

export class GeneticLogic {
    private nn: NeuralNetwork[] = [];
    private population: number = 0;
    private mutateRate = 0.5;
    private top_units_percent = 40;
    private get top_units() { return Math.round(this.nn.length * this.top_units_percent / 100); }

    public init(length: number) {
        this.generateRandomNN(length);
        this.population = 1;
    }

    public feedForward(index: number, inputs: number[]): number[] {
        return this.nn[index].feedForward([...inputs]);
    }

    public fillFitness(index: number, value: number) {
        this.nn[index].fitness = value;
    }

    public nextGeneration(): number {
        if (this.nn.length < 2) {
            return 1;
        }
        var Winners = this.selection();

        if (Winners[0].fitness - config.defaultPlayerX < config.defaultPosition + config.columnWidth) {
            this.init(this.nn.length);
            return 1;
        }

        // fill the rest of the next population with new units using crossover and mutation
        for (let i = this.top_units; i < this.nn.length; i++) {
            var parentA, parentB, offspring;

            if (i === this.top_units) {
                // offspring is made by a crossover of two best winners
                parentA = Winners[0].copy();
                parentB = Winners[1].copy();
                offspring = this.crossOver(parentA, parentB);

            } else if (i <= this.nn.length - 2) {
                // offspring is made by a crossover of two random winners
                parentA = this.getRandomUnit(Winners).copy();
                parentB = this.getRandomUnit(Winners).copy();
                offspring = this.crossOver(parentA, parentB);
            } else {
                // offspring is a random winner
                offspring = this.getRandomUnit(Winners).copy();
            }

            // mutate the offspring
            offspring = this.mutation(offspring);

            // update population by changing the old unit with the new one
            this.nn[i] = offspring;
        }

        for (var i = 0; i < this.nn.length; i++) {
            this.nn[i].fitness = 0;
        }

        return ++this.population;
    }

    private generateRandomNN(length: number) {
        this.nn = Array.from({ length }, x => (new NeuralNetwork([2, 6, 1])));
    }

    // performs random mutations on the offspring
    private mutation = (offspring: NeuralNetwork) => {
        // mutate some 'bias' information of the offspring neurons
        for (let i = 0; i < offspring.layers.length; i++) {
            for (let j = 0; j < offspring.layers[i].biases.length; j++) {
                offspring.layers[i].biases[j] = this.mutate(offspring.layers[i].biases[j]);
            }
        }
        // mutate some 'weights' information of the offspring connections
        for (let i = 0; i < offspring.layers.length; i++) {
            for (let j = 0; j < offspring.layers[i].weights.length; j++) {
                for (let k = 0; k < offspring.layers[i].weights[j].length; k++) {
                    offspring.layers[i].weights[j][k] = this.mutate(offspring.layers[i].weights[j][k]);
                }
            }
        }

        return offspring;
    }

    private mutate = (gene: number): number => {
        if (Math.random() < this.mutateRate) {
            gene = Math.random() * 2.0 - 1.0;
        }

        return gene;
    }

    private selection() {
        // sort the units of the current population	in descending order by their fitness
        var sortedPopulation = this.nn.sort(
            function (unitA, unitB) {
                return unitB.fitness - unitA.fitness;
            }
        );

        // return an array of the top units from the current population
        return sortedPopulation.slice(0, this.top_units);
    }

    private getRandomUnit = (array: NeuralNetwork[]): NeuralNetwork => {
        return array[this.random(0, array.length - 1)];
    }

    // performs a single point crossover between two parents
    private crossOver = (parentA: NeuralNetwork, parentB: NeuralNetwork) => {
        const cutPoint = this.random(0, parentA.layers.length - 1);

        // swap 'bias' information between both parents:
        // 1. left side to the crossover point is copied from one parent
        // 2. right side after the crossover point is copied from the second parent
        for (let i = cutPoint; i < parentA.layers.length; i++) {
            for (let j = 0; j < parentA.layers[i].biases.length; j++) {
                let biasFromParentA = parentA.layers[i].biases[j];
                parentA.layers[i].biases[j] = parentB.layers[i].biases[j];
                parentB.layers[i].biases[j] = biasFromParentA;
            }
        }

        const cutPoint2 = this.random(0, parentA.layers.length - 1);

        // swap 'bias' information between both parents:
        // 1. left side to the crossover point is copied from one parent
        // 2. right side after the crossover point is copied from the second parent
        for (let i = cutPoint2; i < parentA.layers.length; i++) {
            for (let j = 0; j < parentA.layers[i].weights.length; j++) {
                for (let k = 0; k < parentA.layers[i].weights[j].length; k++) {
                    let biasFromParentA = parentA.layers[i].weights[j][k];
                    parentA.layers[i].weights[j][k] = parentB.layers[i].weights[j][k];
                    parentB.layers[i].weights[j][k] = biasFromParentA;
                }
            }
        }

        return this.random(0, 1) === 1 ? parentA : parentB;
    }

    private random = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}