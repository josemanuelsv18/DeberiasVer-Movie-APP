using System.Text.Json.Serialization;

namespace MovieApi.DTOs.TMDB
{
    // ========== Movie DTOs ==========
    public class TmdbMovieListResponse
    {
        public int Page { get; set; }
        public List<TmdbMovie> Results { get; set; } = new();
        public int TotalPages { get; set; }
        public int TotalResults { get; set; }
    }

    public class TmdbMovie
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string OriginalTitle { get; set; } = string.Empty;
        public string Overview { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public string? ReleaseDate { get; set; }
        public double VoteAverage { get; set; }
        public int VoteCount { get; set; }
        public double Popularity { get; set; }
        public List<int> GenreIds { get; set; } = new();
        public bool Adult { get; set; }
        public string OriginalLanguage { get; set; } = string.Empty;
    }

    public class TmdbMovieDetails : TmdbMovie
    {
        public List<TmdbGenre> Genres { get; set; } = new();
        public int? Runtime { get; set; }
        public long Budget { get; set; }
        public long Revenue { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Tagline { get; set; }
        public string? Homepage { get; set; }
        public string? ImdbId { get; set; }
        public List<TmdbProductionCompany> ProductionCompanies { get; set; } = new();
        public TmdbCredits? Credits { get; set; }
        public TmdbVideoResults? Videos { get; set; }
    }

    // ========== TV Show DTOs ==========
    public class TmdbTvListResponse
    {
        public int Page { get; set; }
        public List<TmdbTvShow> Results { get; set; } = new();
        public int TotalPages { get; set; }
        public int TotalResults { get; set; }
    }

    public class TmdbTvShow
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string OriginalName { get; set; } = string.Empty;
        public string Overview { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public string? FirstAirDate { get; set; }
        public double VoteAverage { get; set; }
        public int VoteCount { get; set; }
        public double Popularity { get; set; }
        public List<int> GenreIds { get; set; } = new();
        public List<string> OriginCountry { get; set; } = new();
        public string OriginalLanguage { get; set; } = string.Empty;
    }

    public class TmdbTvShowDetails : TmdbTvShow
    {
        public List<TmdbGenre> Genres { get; set; } = new();
        public List<int> EpisodeRunTime { get; set; } = new();
        public int NumberOfEpisodes { get; set; }
        public int NumberOfSeasons { get; set; }
        public List<TmdbSeason> Seasons { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public string? Tagline { get; set; }
        public string? Homepage { get; set; }
        public string? LastAirDate { get; set; }
        public bool InProduction { get; set; }
        public List<TmdbNetwork> Networks { get; set; } = new();
        public List<TmdbProductionCompany> ProductionCompanies { get; set; } = new();
        public TmdbCredits? Credits { get; set; }
        public TmdbVideoResults? Videos { get; set; }
    }

    // ========== Season & Episode DTOs ==========
    public class TmdbSeason
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Overview { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public string? AirDate { get; set; }
        public int EpisodeCount { get; set; }
        public int SeasonNumber { get; set; }
    }

    public class TmdbSeasonDetails : TmdbSeason
    {
        public List<TmdbEpisode> Episodes { get; set; } = new();
    }

    public class TmdbEpisode
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Overview { get; set; } = string.Empty;
        public string? StillPath { get; set; }
        public string? AirDate { get; set; }
        public int EpisodeNumber { get; set; }
        public int SeasonNumber { get; set; }
        public double VoteAverage { get; set; }
        public int VoteCount { get; set; }
        public int? Runtime { get; set; }
    }

    // ========== Supporting DTOs ==========
    public class TmdbGenre
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class TmdbGenreListResponse
    {
        public List<TmdbGenre> Genres { get; set; } = new();
    }

    public class TmdbProductionCompany
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoPath { get; set; }
        public string OriginCountry { get; set; } = string.Empty;
    }

    public class TmdbNetwork
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoPath { get; set; }
        public string OriginCountry { get; set; } = string.Empty;
    }

    public class TmdbCredits
    {
        public List<TmdbCast> Cast { get; set; } = new();
        public List<TmdbCrew> Crew { get; set; } = new();
    }

    public class TmdbCast
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Character { get; set; } = string.Empty;
        public string? ProfilePath { get; set; }
        public int Order { get; set; }
    }

    public class TmdbCrew
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Job { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? ProfilePath { get; set; }
    }

    public class TmdbVideoResults
    {
        public List<TmdbVideo> Results { get; set; } = new();
    }

    public class TmdbVideo
    {
        public string Id { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Site { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Official { get; set; }
    }

    // ========== Multi Search DTOs ==========
    public class TmdbMultiSearchResponse
    {
        public int Page { get; set; }
        public List<TmdbMultiSearchResult> Results { get; set; } = new();
        public int TotalPages { get; set; }
        public int TotalResults { get; set; }
    }

    public class TmdbMultiSearchResult
    {
        public int Id { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Name { get; set; }
        public string? OriginalTitle { get; set; }
        public string? OriginalName { get; set; }
        public string Overview { get; set; } = string.Empty;
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public string? ReleaseDate { get; set; }
        public string? FirstAirDate { get; set; }
        public double VoteAverage { get; set; }
        public int VoteCount { get; set; }
        public double Popularity { get; set; }

        // Propiedad calculada para obtener el título correcto
        [JsonIgnore]
        public string DisplayTitle => Title ?? Name ?? OriginalTitle ?? OriginalName ?? "Sin título";
        [JsonIgnore]
        public string? DisplayDate => ReleaseDate ?? FirstAirDate;
    }

    // ========== Trending DTOs ==========
    public class TmdbTrendingResponse
    {
        public int Page { get; set; }
        public List<TmdbMultiSearchResult> Results { get; set; } = new();
        public int TotalPages { get; set; }
        public int TotalResults { get; set; }
    }
}
