import { useEffect } from "react";

// Custom hook to fit the map view to the coordinates of the routes
export const useFitToCoordinates = (mapRef, routes) => {
  useEffect(() => {
    if (mapRef.current && routes.length > 0) {
      setTimeout(() => {
        // Flatten the route coordinates into a single array
        const routeCoordinates = routes.flatMap((route) => route.path);
        // Fit the map view to the route coordinates with edge padding
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }, 300); // Delay to ensure the map is ready
    }
  }, [routes, mapRef]);
};
