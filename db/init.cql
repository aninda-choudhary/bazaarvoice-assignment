CREATE KEYSPACE IF NOT EXISTS follower_data 
    WITH REPLICATION = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
};

CREATE TABLE follower_data.follower_count (
        id INT,
        timestamp TIMESTAMP,
        count DECIMAL,
        PRIMARY KEY ((id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp ASC);

CREATE TABLE follower_data.averages (
        id INT,
        timestamp TIMESTAMP,
        average INT,
        count INT,
        PRIMARY KEY ((id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC);