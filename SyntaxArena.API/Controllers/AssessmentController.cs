using Microsoft.AspNetCore.Mvc;

namespace SyntaxArena.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentController : ControllerBase
    {
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
            // Stub: Module 6 will handle real execution
            return Ok(new
            {
                Status = "Passed",
                ExecutionTimeMs = 45,
                MemoryUsedKb = 12000,
                Output = "Test cases passed successfully."
            });
        }
    }

    public class RunCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
    }
}
