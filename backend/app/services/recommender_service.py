import math
import re

from app.core.config import settings
from app.schemas.analysis import BreedMatch, BreedRecommendationRequest, BreedRecommendationResponse

try:
    import pandas as pd
except Exception:
    pd = None


class RecommenderService:
    DATASET_VECTOR_COLUMNS = [
        "Affectionate With Family",
        "Good With Young Children",
        "Good With Other Dogs",
        "Shedding Level",
        "Coat Grooming Frequency",
        "Drooling Level",
        "Openness To Strangers",
        "Playfulness Level",
        "Watchdog/Protective Nature",
        "Adaptability Level",
        "Trainability Level",
        "Energy Level",
        "Barking Level",
        "Mental Stimulation Needs",
        "height_c",
        "weight_c",
        "life_c",
        "coat_length_c",
    ]

    def __init__(self) -> None:
        self.vector_mins: dict[str, float] = {}
        self.vector_scales: dict[str, float] = {}
        self.source = "curated-profile-fallback"
        self.warning = "The original AKC CSV dataset was missing in this repo, so a curated profile set is being used for now."
        self.profiles = self._fallback_profiles()
        self._load_dataset_profiles()

    @property
    def dataset_ready(self) -> bool:
        return self.source == "csv-dataset"

    @property
    def dataset_size(self) -> int:
        return len(self.profiles)

    def _fallback_profiles(self) -> list[dict]:
        return [
            {
                "name": "Labrador Retriever",
                "summary": "Friendly, playful, and adaptable for active families.",
                "url": "https://www.akc.org/dog-breeds/labrador-retriever/",
                "vector": [5, 5, 5, 4, 3, 2, 5, 5, 3, 5, 5, 5, 3, 5, 57, 30, 12, 1],
            },
            {
                "name": "Beagle",
                "summary": "Cheerful scent hound with moderate size and strong curiosity.",
                "url": "https://www.akc.org/dog-breeds/beagle/",
                "vector": [5, 5, 4, 3, 2, 1, 4, 5, 2, 4, 3, 4, 4, 4, 38, 11, 13, 1],
            },
            {
                "name": "German Shepherd",
                "summary": "Highly trainable protector with strong energy and focus needs.",
                "url": "https://www.akc.org/dog-breeds/german-shepherd-dog/",
                "vector": [4, 4, 3, 4, 3, 2, 3, 4, 5, 4, 5, 5, 3, 5, 65, 34, 11, 2],
            },
            {
                "name": "Bulldog",
                "summary": "Calm, affectionate companion with lower exercise requirements.",
                "url": "https://www.akc.org/dog-breeds/bulldog/",
                "vector": [5, 4, 3, 3, 2, 4, 4, 3, 3, 4, 3, 2, 2, 2, 36, 22, 9, 1],
            },
            {
                "name": "Poodle",
                "summary": "Intelligent, elegant, and very trainable with higher grooming needs.",
                "url": "https://www.akc.org/dog-breeds/poodle-standard/",
                "vector": [4, 4, 4, 2, 5, 1, 4, 4, 3, 4, 5, 4, 3, 5, 55, 24, 13, 3],
            },
        ]

    def _clean_range(self, raw_value: object) -> float:
        if raw_value is None:
            return 0.0
        text = str(raw_value).strip()
        if not text or text.lower() == "nan":
            return 0.0
        numbers = [float(match) for match in re.findall(r"\d+(?:\.\d+)?", text)]
        return sum(numbers) / len(numbers) if numbers else 0.0

    def _clean_coat_length(self, raw_value: object) -> float:
        if raw_value is None:
            return 1.0
        text = str(raw_value).lower()
        if "long" in text:
            return 3.0
        if "medium" in text:
            return 2.0
        return 1.0

    def _display_name(self, raw_name: object) -> str:
        text = str(raw_name or "").replace("_", " ").replace("-", " ").strip()
        return " ".join(word.capitalize() for word in text.split()) or "Unknown Breed"

    def _slugify(self, raw_name: object) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", str(raw_name or "").strip().lower())
        return slug.strip("-")

    def _clean_text(self, raw_value: object) -> str | None:
        if raw_value is None:
            return None
        text = " ".join(str(raw_value).split())
        if not text or text.lower() == "nan":
            return None
        return text

    def _row_summary(self, row: "pd.Series") -> str:
        parts = []
        for column in ["health", "grooming", "excercise", "training", "nutrition"]:
            text = self._clean_text(row.get(column))
            if text:
                parts.append(text.rstrip("."))
        if not parts:
            return "Matched from the restored source breed dataset."
        summary = ". ".join(parts[:2]).strip()
        if not summary.endswith("."):
            summary += "."
        return summary[:240]

    def _normalize_vector(self, vector: list[float]) -> list[float]:
        normalized: list[float] = []
        for index, column in enumerate(self.DATASET_VECTOR_COLUMNS):
            minimum = self.vector_mins[column]
            scale = self.vector_scales[column]
            normalized.append((vector[index] - minimum) / scale if scale else 0.0)
        return normalized

    def _load_dataset_profiles(self) -> None:
        dataset_path = settings.data_dir / "dog_data_09032022.csv"
        if pd is None or not dataset_path.exists():
            return

        try:
            frame = pd.read_csv(dataset_path)
        except Exception:
            return

        if frame.empty or "dog" not in frame.columns:
            return

        working = frame.copy()
        working["height_c"] = working.get("height").apply(self._clean_range)
        working["weight_c"] = working.get("weight").apply(self._clean_range)
        working["life_c"] = working.get("life").apply(self._clean_range)
        working["coat_length_c"] = working.get("Coat Length").apply(self._clean_coat_length)

        for column in self.DATASET_VECTOR_COLUMNS:
            working[column] = pd.to_numeric(working[column], errors="coerce")

        medians = working[self.DATASET_VECTOR_COLUMNS].median(numeric_only=True)
        working[self.DATASET_VECTOR_COLUMNS] = working[self.DATASET_VECTOR_COLUMNS].fillna(medians)

        mins = working[self.DATASET_VECTOR_COLUMNS].min()
        maxs = working[self.DATASET_VECTOR_COLUMNS].max()
        scales = (maxs - mins).replace(0, 1.0)

        profiles: list[dict] = []
        for _, row in working.iterrows():
            vector = [float(row[column]) for column in self.DATASET_VECTOR_COLUMNS]
            profiles.append(
                {
                    "name": self._display_name(row.get("dog")),
                    "summary": self._row_summary(row),
                    "url": f"https://www.akc.org/dog-breeds/{self._slugify(row.get('dog'))}/",
                    "vector": vector,
                    "normalized_vector": [(float(row[column]) - float(mins[column])) / float(scales[column]) for column in self.DATASET_VECTOR_COLUMNS],
                }
            )

        if profiles:
            self.profiles = profiles
            self.vector_mins = {column: float(mins[column]) for column in self.DATASET_VECTOR_COLUMNS}
            self.vector_scales = {column: float(scales[column]) for column in self.DATASET_VECTOR_COLUMNS}
            self.source = "csv-dataset"
            self.warning = None

    def recommend(self, payload: BreedRecommendationRequest) -> BreedRecommendationResponse:
        incoming = [
            payload.affectionate_with_family,
            payload.good_with_young_children,
            payload.good_with_other_dogs,
            payload.shedding_level,
            payload.coat_grooming_frequency,
            payload.drooling_level,
            payload.openness_to_strangers,
            payload.playfulness_level,
            payload.watchdog_protective_nature,
            payload.adaptability_level,
            payload.trainability_level,
            payload.energy_level,
            payload.barking_level,
            payload.mental_stimulation_needs,
            payload.height_c,
            payload.weight_c,
            payload.life_c,
            payload.coat_length_c,
        ]

        if self.dataset_ready:
            normalized_incoming = self._normalize_vector(incoming)
            scored = []
            for profile in self.profiles:
                distance = math.sqrt(
                    sum((left - right) ** 2 for left, right in zip(normalized_incoming, profile["normalized_vector"]))
                )
                scored.append((profile, distance))
            max_distance = max((distance for _, distance in scored), default=1.0) or 1.0
            matches = [
                BreedMatch(
                    name=profile["name"],
                    similarity=round(max(0.0, (1 - (distance / max_distance)) * 100), 2),
                    url=profile["url"],
                    summary=profile["summary"],
                )
                for profile, distance in scored
            ]
            matches.sort(key=lambda item: item.similarity, reverse=True)
            return BreedRecommendationResponse(
                matches=matches[:5],
                source=self.source,
                warning=self.warning,
                dataset_size=self.dataset_size,
            )

        matches: list[BreedMatch] = []
        for profile in self.profiles:
            distance = math.sqrt(sum((a - b) ** 2 for a, b in zip(incoming, profile["vector"])))
            similarity = max(45.0, 100 - distance)
            matches.append(
                BreedMatch(
                    name=profile["name"],
                    similarity=round(similarity, 2),
                    url=profile["url"],
                    summary=profile["summary"],
                )
            )
        matches.sort(key=lambda item: item.similarity, reverse=True)
        return BreedRecommendationResponse(
            matches=matches[:5],
            source=self.source,
            warning=self.warning,
            dataset_size=self.dataset_size,
        )


recommender_service = RecommenderService()
