namespace Backend.Data;

public class JwtSettingsOptions
{
    public const string SectionName = "JwtSettings";

    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 24;

    public IEnumerable<string> Validate()
    {
        if (string.IsNullOrWhiteSpace(Secret))
            yield return $"{SectionName}:Secret is required";
        else if (Secret.Length < 32)
            yield return $"{SectionName}:Secret must be at least 32 characters";

        if (string.IsNullOrWhiteSpace(Issuer))
            yield return $"{SectionName}:Issuer is required";

        if (string.IsNullOrWhiteSpace(Audience))
            yield return $"{SectionName}:Audience is required";

        if (ExpirationHours <= 0)
            yield return $"{SectionName}:ExpirationHours must be greater than 0";
    }
}
