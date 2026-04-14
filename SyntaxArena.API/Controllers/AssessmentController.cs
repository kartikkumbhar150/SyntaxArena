using Microsoft.AspNetCore.Mvc;
using SyntaxArena.API.Services;

namespace SyntaxArena.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentController : ControllerBase
    {
        private readonly IRabbitMQProducer _producer;

        public AssessmentController(IRabbitMQProducer producer)
        {
            _producer = producer;
        }

        [HttpGet("{id}")]
        public IActionResult GetProblem(string id)
        {
            // Stub: return a mocked problem outline
            return Ok(new
            {
                Id = id,
                Title = "Two Sum",
                Description = "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
                Difficulty = "Easy",
                TimeLimit = 2000,
                MemoryLimit = 256
            });
        }

        [HttpPost("{id}/run")]
        public IActionResult RunCode(string id, [FromBody] RunCodeRequest request)
        {
            // Publish the task to RabbitMQ to be handled by the ExecutionWorker
            _producer.SendCodeExecutionTask(new {
                AssessmentId = id,
                Code = request.Code,
                Language = request.Language,
                Timestamp = DateTime.UtcNow
            });

            return Accepted(new
            {
                Status = "Queued",
                Message = "Code execution request added to the queue."
            });
        }
    }

    public class RunCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }
}
