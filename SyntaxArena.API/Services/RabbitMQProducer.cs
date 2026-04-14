using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

namespace SyntaxArena.API.Services
{
    public interface IRabbitMQProducer
    {
        void SendCodeExecutionTask<T>(T message);
    }

    public class RabbitMQProducer : IRabbitMQProducer
    {
        public void SendCodeExecutionTask<T>(T message)
        {
            var factory = new ConnectionFactory
            {
                HostName = "localhost" // Assuming a local RabbitMQ instance for now
            };

            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(queue: "execution_queue",
                                 durable: true,
                                 exclusive: false,
                                 autoDelete: false,
                                 arguments: null);

            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = channel.CreateBasicProperties();
            properties.Persistent = true;

            channel.BasicPublish(exchange: "",
                                 routingKey: "execution_queue",
                                 basicProperties: properties,
                                 body: body);
        }
    }
}
