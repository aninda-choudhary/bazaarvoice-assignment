const cassandra = require('cassandra-driver');

// Create a new Cassandra client
const client = new cassandra.Client({
  contactPoints: ['localhost:9042'],
  localDataCenter: 'datacenter1',
  keyspace: 'follower_data'
});

const followerCountTableQuery = `
      CREATE TABLE follower_count (
        id INT,
        timestamp TIMESTAMP,
        count DECIMAL,
        PRIMARY KEY ((id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp ASC);
    `;
const followerAverageTableQuery = `
      CREATE TABLE averages (
        id INT,
        timestamp TIMESTAMP,
        average INT,
        count INT,
        PRIMARY KEY ((id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC);
    `;

// Function to execute the CREATE TABLE queries
async function createTables() {
  try {
    // Create the main_data table
    await client.execute(followerCountTableQuery);
    console.log('follower count table created successfully');

    // Create the averages table
    await client.execute(followerAverageTableQuery);
    console.log('averages table created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    // Shut down the Cassandra client connection
    await client.shutdown();
  }
}

// Call the createTables function
createTables();