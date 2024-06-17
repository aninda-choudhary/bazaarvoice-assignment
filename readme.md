# Mockstagram Worker Example

This repository is is built using Node.js, Kafka, and Cassandra. The system consists of a producer that pushes messages to a Kafka queue, and workers that consume and process the messages to store the results in a cassandra database.

## Getting Started

1. Start the Docker containers:
    docker-compose up --build -d

2. Install the project dependencies:
    npm install

3. Set up the Kafka topics:
    npm run setup-kafka

4. Start the worker processes (you can run multiple workers in separate terminals):
    npm run worker

5. Start the Mockstagram server (if it's not already running):
    npm run mockstagram

6. Start the producer:
    npm run producer

The producer will start pushing messages to the Kafka queue, and the workers will consume and process the messages.

## Architecture

The system consists of the following components:

- **Producer**: Generates and pushes messages to the Kafka queue.
- **Workers**: Consume messages from the Kafka queue, process the data, and store the results in Cassandra.

The communication between the components is achieved using Kafka topics.

## Dependencies

- Node.js
- Kafka
- Cassandra
- Docker and Docker Compose