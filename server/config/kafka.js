import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

// 1. Initialize the Kafka Client
const kafka = new Kafka({
  clientId: "mike_ai_node_gateway",
  // Fallback to localhost:9092 if the environment variable isn't set
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8, // Automatically retry connection if the broker is booting up
  },
});

// 2. Create the Producer instance
const producer = kafka.producer();

// ✅ Connect the Producer to the Broker
export const connectKafkaProducer = async () => {
  try {
    await producer.connect();
    console.log("✅ Kafka Producer connected successfully");
  } catch (error) {
    console.error("❌ Kafka Producer connection error:", error.message);
    // Depending on your preference, you can uncomment the next line to kill the server if Kafka fails
    // process.exit(1); 
  }
};

// ✅ Publish a User Command to a Topic
export const publishCommandToAI = async (topic, commandData) => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(commandData) },
      ],
    });
    // Optional: Log success for local debugging
    // console.log(`📤 Successfully published command ${commandData.commandId} to [${topic}]`);
  } catch (error) {
    console.error(`❌ Failed to publish to Kafka topic ${topic}:`, error.message);
    throw new Error("Message broker failed to queue command");
  }
};

// ✅ Graceful Shutdown (Useful if you implement server teardown logic)
export const disconnectKafkaProducer = async () => {
  try {
    await producer.disconnect();
    console.log("🛑 Kafka Producer disconnected");
  } catch (error) {
    console.error("❌ Kafka Producer disconnect error:", error.message);
  }
};