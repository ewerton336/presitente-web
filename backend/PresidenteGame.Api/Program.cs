using PresidenteGame.Api.Hubs;
using PresidenteGame.Core;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();
builder.Services.AddSingleton<RoomManager>();
builder.Services.AddSingleton<GameEngine>();

// Configure CORS - Permite acesso de qualquer IP da rede local
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)  // Permite qualquer origem
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AllowAll");

app.MapHub<GameHub>("/gameHub");

app.MapGet("/", () => "Presidente Game API is running!");

app.Run();
