namespace Backend.Tests.Controllers;

using System.Reflection;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Verifies that no controller class declares duplicate (versioned + unversioned) Route attributes,
/// which is the root cause of Swashbuckle throwing HTTP 500 at /swagger/v1/swagger.json.
/// </summary>
public class SwaggerRouteConflictTests
{
    [Fact]
    public void NoController_ShouldHaveMoreThanOneClassLevelRouteAttribute()
    {
        var controllerAssembly = typeof(Backend.Controllers.AuthController).Assembly;

        var controllerTypes = controllerAssembly
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && typeof(ControllerBase).IsAssignableFrom(t));

        var violations = new List<string>();

        foreach (var controller in controllerTypes)
        {
            var routeAttributes = controller.GetCustomAttributes<RouteAttribute>(inherit: false);
            if (routeAttributes.Count() > 1)
            {
                var routes = string.Join(", ", routeAttributes.Select(r => $"\"{r.Template}\""));
                violations.Add($"{controller.Name} has {routeAttributes.Count()} Route attributes: {routes}");
            }
        }

        Assert.True(
            violations.Count == 0,
            $"The following controllers have multiple class-level Route attributes which cause " +
            $"Swashbuckle to throw when generating /swagger/v1/swagger.json:\n" +
            string.Join("\n", violations));
    }
}
