export type AnimalType = "dog" | "cat" | "bird" | "fish" | "reptile" | "rabbit" | "horse";

export interface FooterConfig {
  animal: AnimalType;
  showBall: boolean;
  animalMoves: boolean;
}

export const footerConfigs: Record<string, FooterConfig> = {
  "/": {
    animal: "dog",
    showBall: true,
    animalMoves: true,
  },
  "/category/Dog": {
    animal: "dog",
    showBall: true,
    animalMoves: true,
  },
  "/category/Cat": {
    animal: "cat",
    showBall: false,
    animalMoves: false,
  },
  "/category/Bird": {
    animal: "bird",
    showBall: false,
    animalMoves: true,
  },
  "/category/Fish": {
    animal: "fish",
    showBall: false,
    animalMoves: true,
  },
  "/category/Reptile": {
    animal: "reptile",
    showBall: false,
    animalMoves: true,
  },
  "/category/Rabbit": {
    animal: "rabbit",
    showBall: false,
    animalMoves: false,
  },
  "/category/Horse": {
    animal: "horse",
    showBall: false,
    animalMoves: true,
  },
};