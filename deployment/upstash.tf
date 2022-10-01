resource "upstash_kafka_cluster" "planetfall" {
  cluster_name = "planetfall"
  region       = "eu-west-1"
  multizone    = "false"
}

resource "upstash_kafka_topic" "endpoint_created" {
  topic_name       = "endpoint.created"
  partitions       = 1
  cleanup_policy   = "delete"
  retention_time   = 625135
  retention_size   = 725124
  max_message_size = 829213


}

resource "upstash_kafka_topic" "endpoint_updated" {
  topic_name       = "endpoint.updated"
  partitions       = 1
  cleanup_policy   = "delete"
  retention_time   = 625135
  retention_size   = 725124
  max_message_size = 829213


}

resource "upstash_kafka_topic" "endpoint_deleted" {
  topic_name       = "endpoint.deleted"
  partitions       = 1
  cleanup_policy   = "delete"
  retention_time   = 625135
  retention_size   = 725124
  max_message_size = 829213


}
