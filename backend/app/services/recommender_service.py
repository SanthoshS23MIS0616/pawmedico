from math import sqrt

from app.schemas.analysis import BreedMatch, BreedRecommendationRequest, BreedRecommendationResponse


class RecommenderService:
    def __init__(self) -> None:
        self.profiles = [
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
        matches: list[BreedMatch] = []
        for profile in self.profiles:
            distance = sqrt(sum((a - b) ** 2 for a, b in zip(incoming, profile["vector"])))
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
            source="curated-profile-fallback",
            warning="The original AKC CSV dataset was missing in this repo, so a curated profile set is being used for now.",
        )


recommender_service = RecommenderService()

