import paneerTikka from "@/assets/dishes/paneer-tikka.jpg";
import chickenTikka from "@/assets/dishes/chicken-tikka.jpg";
import springRolls from "@/assets/dishes/spring-rolls.jpg";
import butterChicken from "@/assets/dishes/butter-chicken.jpg";
import paneerButterMasala from "@/assets/dishes/paneer-butter-masala.jpg";
import dalMakhani from "@/assets/dishes/dal-makhani.jpg";
import biryani from "@/assets/dishes/biryani.jpg";
import margheritaPizza from "@/assets/dishes/margherita-pizza.jpg";
import cheeseBurger from "@/assets/dishes/cheese-burger.jpg";
import gulabJamun from "@/assets/dishes/gulab-jamun.jpg";
import chocolateBrownie from "@/assets/dishes/chocolate-brownie.jpg";
import coldCoffee from "@/assets/dishes/cold-coffee.jpg";
import fallback from "@/assets/hero.jpg";

const map: Record<string, string> = {
  "paneer-tikka": paneerTikka,
  "chicken-tikka": chickenTikka,
  "spring-rolls": springRolls,
  "butter-chicken": butterChicken,
  "paneer-butter-masala": paneerButterMasala,
  "dal-makhani": dalMakhani,
  biryani,
  "margherita-pizza": margheritaPizza,
  "cheese-burger": cheeseBurger,
  "gulab-jamun": gulabJamun,
  "chocolate-brownie": chocolateBrownie,
  "cold-coffee": coldCoffee,
};

export function dishImage(key?: string | null): string {
  if (key && map[key]) return map[key];
  return fallback;
}

export const dishImageKeys = Object.keys(map);