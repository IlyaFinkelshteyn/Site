﻿module IsraelHiking.Controllers {
    export interface IMainMapScope extends angular.IScope {
        sidebarService: Services.SidebarService;
        getIsSidebarVisible(): boolean;
        closeSidebar(): void;
    }

    export class MainMapcontoller extends BaseMapController {
        $compile: angular.ICompileService;

        constructor($scope: IMainMapScope,
            $compile: angular.ICompileService,
            mapService: Services.MapService,
            hashService: Services.HashService,
            sidebarService: Services.SidebarService) {
            super(mapService);

            this.map = mapService.map;
            this.map.setZoom(hashService.zoom);
            this.map.panTo(hashService.latlng);
            this.$compile = $compile;
            this.createControls($scope);

            $scope.sidebarService = sidebarService;

            $scope.getIsSidebarVisible = () => {
                return sidebarService.isVisible;
            }

            $scope.closeSidebar = () => {
                sidebarService.hide();
            }

            this.map.on("moveend",() => {
                hashService.updateLocation(this.map.getCenter(), this.map.getZoom());
            });
        }

        private createControls = ($scope: angular.IRootScopeService) => {
            this.createContorl($scope, "zoom-control");

            (L as any).control.locate({ compile: this.$compile, scope: $scope.$new(), icon: "fa fa-location-arrow", keepCurrentZoomLevel: true, follow: true }).addTo(this.map);

            this.createContorl($scope, "layers-control");
            this.createContorl($scope, "file-control");
            this.createContorl($scope, "save-as-control");
            this.createContorl($scope, "edit-osm-control");
            this.createContorl($scope, "info-help-control");
            this.createContorl($scope, "search-control", "topright");
            this.createContorl($scope, "drawing-control", "topright");
            this.createContorl($scope, "share-control", "topright");

            L.control.scale({ imperial: false } as L.ScaleOptions).addTo(this.map);
        }

        /**
         * Creates a control on the leaflet map
         * 
         * @param directiveHtmlName - the dricetive html string
         * @param position - the position to place the control: topleft/topright/bottomleft/bottomright
         */
        private createContorl($scope: angular.IRootScopeService, directiveHtmlName: string, position = "topleft") {
            var control = L.Control.extend({
                options: {
                    position: position
                } as L.ControlOptions,
                onAdd: (): HTMLElement => {
                    var controlDiv = angular.element("<div>")
                        .addClass(directiveHtmlName + "-container")
                        .append(this.$compile(`<${directiveHtmlName}></${directiveHtmlName}>`)($scope.$new()));
                    return controlDiv[0];
                },
                onRemove: () => { }
            } as L.ClassExtendOptions);
            new control().addTo(this.map);
        }
    }
} 
