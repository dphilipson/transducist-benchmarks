import Benchmark from "benchmark";
import Lazy from "lazy.js";
import _ from "lodash";
import * as R from "ramda";
import * as tdash from "transducers-js";
import * as tdot from "transducers.js";
import { chainFrom, rangeIterator } from "transducist";

const double = (x: number) => x * 2;
const notFiveMultiple = (x: number) => x % 5 !== 0;
const inc = (x: number) => x + 1;
const isThreeMultiple = (x: number) => x % 3 === 0;

const arg = Number(process.argv[2]);
if (!isNaN(arg)) {
    runBenchmark(arg);
} else {
    [10, 100, 1000, 10000, 100000].forEach(n => {
        runBenchmark(n);
        console.log("");
    });
}

function runBenchmark(n: number): void {
    console.log(`Running benchmark for n = ${n}`);
    console.log(`---------------------------------`);

    const arr = Array.from(rangeIterator(n));

    new Benchmark.Suite()
        .add("transducist", () => {
            chainFrom(arr)
                .map(double)
                .filter(notFiveMultiple)
                .map(inc)
                .filter(isThreeMultiple)
                .toArray();
        })
        .add("lodash (without chain)", () => {
            let result = arr;
            result = _.map(result, double);
            result = _.filter(result, notFiveMultiple);
            result = _.map(result, inc);
            result = _.filter(result, isThreeMultiple);
        })
        .add("lodash (with chain)", () => {
            _(arr)
                .map(double)
                .filter(notFiveMultiple)
                .map(inc)
                .filter(isThreeMultiple)
                .value();
        })
        .add("ramda", () => {
            R.pipe(
                R.map(double),
                // @ts-ignore
                R.filter(notFiveMultiple),
                R.map(inc),
                R.filter(isThreeMultiple),
                R.take(10),
            )(arr);
        })
        .add("lazy.js", () => {
            Lazy(arr)
                .map(double)
                .filter(notFiveMultiple)
                .map(inc)
                .filter(isThreeMultiple)
                .toArray();
        })
        .add("transducers.js", () => {
            const transform = tdot.compose(
                tdot.map(double),
                tdot.filter(notFiveMultiple),
                tdot.map(inc),
                tdot.filter(isThreeMultiple),
            );
            tdot.into([], transform, arr);
        })
        .add("transducers-js", () => {
            const transform = tdash.comp(
                tdash.map(double),
                tdash.filter(notFiveMultiple),
                tdash.map(inc),
                tdash.filter(isThreeMultiple),
            );
            tdash.into([], transform, arr);
        })
        .add("native array methods", () => {
            arr.map(double)
                .filter(notFiveMultiple)
                .map(inc)
                .filter(isThreeMultiple);
        })
        .add("hand-optimized loop", () => {
            const result: number[] = [];
            for (let i = 0, { length } = arr; i < length; i++) {
                const x1 = 2 * arr[i];
                if (x1 % 5 !== 0) {
                    const x2 = x1 + 1;
                    if (x2 % 3 === 0) {
                        result.push(x2);
                    }
                }
            }
        })
        .on("cycle", (event: any) => console.log(String(event.target)))
        .run();
}
