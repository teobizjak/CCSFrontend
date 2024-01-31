
import axios from 'axios';

export function BorderColorClass(elo) {
    if (elo > 2000) {
        // Most royal and prestigious, using a gradient with luxurious colors
        return("bg-gradient-to-tr from-purple-700 via-blue-500 to-purple-700");
    } else if (elo > 1800) {
        // Second highest ELO, still prestigious, using a vibrant gradient
        return("bg-gradient-to-tr from-green-500 via-teal-500 to-green-500");
    } else if (elo > 1500) {
        // Solid color, but still signifies a higher status
        return(" bg-blue-500");
    } else if (elo > 820) {
        // Less vibrant, indicating a lower status than above
        return("bg-green-400");
    } else {
        // Least attractive, indicating the lowest ELO range
        return("bg-gray-400");
    }
}
