using Microsoft.AspNetCore.Mvc;

namespace SyntaxArena.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Stub for now. We will implement real JWT auth in Phase 2/3.
            return Ok(new
            {
                Token = "fake-jwt-token-ey...",
                User = new {
                    Id = Guid.NewGuid().ToString(),
                    Email = request.Email,
                    Name = request.Email.Contains("recruiter") ? "Alice (Recruiter)" : "Bob (Candidate)",
                    Role = request.Email.Contains("recruiter") ? "recruiter" : "candidate"
                }
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
