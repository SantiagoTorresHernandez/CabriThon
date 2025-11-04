# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["CabriThon.Api/CabriThon.Api.csproj", "CabriThon.Api/"]
COPY ["CabriThon.Core/CabriThon.Core.csproj", "CabriThon.Core/"]
COPY ["CabriThon.Infrastructure/CabriThon.Infrastructure.csproj", "CabriThon.Infrastructure/"]
RUN dotnet restore "CabriThon.Api/CabriThon.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/CabriThon.Api"
RUN dotnet build "CabriThon.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "CabriThon.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CabriThon.Api.dll"]

# Set environment variable for ASP.NET Core to listen on port 8080
ENV ASPNETCORE_URLS=http://+:8080

