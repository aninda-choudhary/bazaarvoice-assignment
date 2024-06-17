class StatsCalculator {

    computeNewAverage(follower_count: number, data_count: number, currentAverage: number){
        let newAverage = 0;
        if (currentAverage > 0) {
            newAverage =
              (currentAverage +
                follower_count / data_count) /
              ((data_count + 1) / data_count);
          } else {
            newAverage = follower_count;
          }

          return { average: newAverage , count : data_count+1}
    }
}

const calculator = new StatsCalculator();

const value = calculator.computeNewAverage(500, 6, 300);
console.log(value);

