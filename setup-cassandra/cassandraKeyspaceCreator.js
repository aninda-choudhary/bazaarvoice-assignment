const casssandra = require('cassandra-driver');

const client = new casssandra.Client({
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
})

const createKeySpaceQuery = `
    CREATE KEYSPACE IF NOT EXISTS follower_data 
    WITH REPLICATION = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
    };
`;

client.execute(createKeySpaceQuery, (err,result) => {
    if(err){
        console.error('Error creating keyspace',err);
    }else{
        console.log("Keyspace created successfully");
    }

    client.shutdown();
});