#!/bin/bash

MAX_RETRIES=30
RETRY_COUNT=0

# Function to run CQL initialization commands
initialize_cassandra() {
  until cqlsh -e 'describe keyspaces'; do
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
      echo "cqlsh: Cassandra is unavailable - reached maximum retries"
      exit 1
    fi
    echo "cqlsh: Cassandra is unavailable - retrying"
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT + 1))
  done

  # Execute the CQL file
  cqlsh -f /init.cql
}

initialize_cassandra &


bash /usr/local/bin/docker-entrypoint.sh