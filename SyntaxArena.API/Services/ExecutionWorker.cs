using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Docker.DotNet;
using Docker.DotNet.Models;

namespace SyntaxArena.API.Services
{
    public class ExecutionWorker : BackgroundService
    {
        private IConnection _connection;
        private IModel _channel;

        public ExecutionWorker()
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            try
            {
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();
                _channel.QueueDeclare(queue: "execution_queue", durable: true, exclusive: false, autoDelete: false, arguments: null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RabbitMQ not available. Ensure RabbitMQ is running. {ex.Message}");
            }
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_channel == null) return Task.CompletedTask;

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                Console.WriteLine($"[Worker] Received Code Execution Request: {message}");

                // 1. Parse Message
                // 2. Invoke Docker Service (Docker.DotNet)
                // 3. Capture Result
                // 4. Send back via SignalR or save to DB
                await ProcessExecutionWithDockerMockAsync(message);

                _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };

            _channel.BasicConsume(queue: "execution_queue", autoAck: false, consumer: consumer);

            return Task.CompletedTask;
        }

        private async Task ProcessExecutionWithDockerMockAsync(string payload)
        {
            // Real implementation uses DockerClient to spin up container, pass code via stdin, read stdout
            // Implementing strict resource limits:
            // Memory: 256MB, NetworkDisabled: true
            
            try 
            {
                /* 
                using var dockerClient = new DockerClientConfiguration(new Uri("npipe://./pipe/docker_engine")).CreateClient(); // Windows
                var containerParams = new CreateContainerParameters {
                    Image = "node:18-alpine",
                    Cmd = new List<string> { "node", "-e", "console.log('Processed by Docker Worker');" },
                    HostConfig = new HostConfig {
                        NetworkMode = "none",
                        Memory = 256 * 1024 * 1024, // 256MB
                    }
                };
                var response = await dockerClient.Containers.CreateContainerAsync(containerParams);
                await dockerClient.Containers.StartContainerAsync(response.ID, new ContainerStartParameters());
                // ... logic to read logs and enforce 2000ms timeout
                // await dockerClient.Containers.KillContainerAsync(response.ID, new ContainerKillParameters());
                */
                Console.WriteLine("[Docker] Container ephemeral lifecycle executed.");
            }
            catch(Exception ex)
            {
                Console.WriteLine($"[Docker Error] {ex.Message}");
            }

            // Simulate execution time
            await Task.Delay(500); 
        }

        public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}
