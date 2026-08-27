# Imports approved media from the CropExpert asset library into this project.
# Source filenames contain status markers and Unicode punctuation, so each asset is
# matched by a distinctive substring rather than an exact literal name.
#
# Usage:  pwsh -File scripts/import-source-assets.ps1 [-SourceRoot <path>]

[CmdletBinding()]
param(
    [string]$SourceRoot = 'C:\BMW_Work\Workspace\Scripts\CropExpert\Assets'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path -LiteralPath $SourceRoot)) {
    Write-Error "Source asset root not found: $SourceRoot"
}

# sourceDir | match substring | destination relative path
$map = @(
    @{ Dir = 'presentation_Scenes'; Match = 'Date_palm_farm_rising_aerial';        Dest = 'assets/video/hero-aerial.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Authorized takeoff';                  Dest = 'assets/video/drone-takeoff.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Inspection flight hero shot';         Dest = 'assets/video/inspection-flight.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Water measurement';                   Dest = 'assets/video/water-measurement.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Drone over the solar array';          Dest = 'assets/video/solar-array.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Ground robot in the greenhouse';      Dest = 'assets/video/greenhouse-robot.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Diagnose';                            Dest = 'assets/video/expert-diagnose.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Agricultural_intelligence_chain';     Dest = 'assets/video/evidence-chain.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Cost of Not Knowing';                 Dest = 'assets/video/cost-of-not-knowing.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Scanner_highlights_pests';            Dest = 'assets/video/ai-detection.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Evidence recorded';                   Dest = 'assets/video/evidence-recorded.mp4' },
    @{ Dir = 'presentation_Scenes'; Match = 'Seen-experts';                        Dest = 'assets/video/expert-network.mp4' },

    @{ Dir = 'presentation_Scenes'; Match = 'Date_palm_leaf_infected_spots';       Dest = 'assets/images/approved/disease-detection.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Date_palms_with_drip_irrigation';     Dest = 'assets/images/approved/drip-irrigation.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Solar_panels_on_farm';                Dest = 'assets/images/approved/solar-panels.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Man_standing_among_date_palms';       Dest = 'assets/images/approved/expert-field.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Date_palm_farm_aerial_view_202608231927.'; Dest = 'assets/images/approved/farm-aerial.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Worker_operating_agricultural';       Dest = 'assets/images/approved/worker-drone.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Agricultural_inspection_drone_on';    Dest = 'assets/images/approved/drone-ground.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Irrigation_line_at_date_farm';        Dest = 'assets/images/approved/irrigation-line.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Date_palm_farm_in_desert_202608231927'; Dest = 'assets/images/approved/desert-farm.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'Inspect-...-Lern-2';                  Dest = 'assets/images/approved/workflow-chain.jpeg' },
    @{ Dir = 'presentation_Scenes'; Match = 'invideo-nanobanana_pro';              Dest = 'assets/images/approved/title-plate.png' },
    @{ Dir = 'presentation_Scenes'; Match = 'drone.png';                           Dest = 'assets/icons/drone.png' },

    @{ Dir = 'mobile-app'; Match = 'mobile-App hero img';                Dest = 'assets/screenshots/original/app-01-hero.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'Assigned Tasks';                     Dest = 'assets/screenshots/original/app-02-assigned-tasks.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'GPS arrival verification';           Dest = 'assets/screenshots/original/app-03-gps-verification.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'before repair evidence';             Dest = 'assets/screenshots/original/app-04-before-evidence.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'Material and Quantity recorder';     Dest = 'assets/screenshots/original/app-05-material-quantity.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'Expert verification status';         Dest = 'assets/screenshots/original/app-06-expert-verification.png' },
    @{ Dir = 'mobile-app'; Match = 'Arabic mobile version';              Dest = 'assets/screenshots/original/app-07-arabic.jpeg' },
    @{ Dir = 'mobile-app'; Match = 'Best-Option - single slide App';     Dest = 'assets/screenshots/original/app-08-overview.jpeg' },

    @{ Dir = 'demo_img'; Match = 'UI Overlay';   Dest = 'assets/screenshots/original/ui-overlay.jpeg' },
    @{ Dir = 'demo_img'; Match = 'image-8.';     Dest = 'assets/screenshots/original/dashboard-concept.jpeg' },
    @{ Dir = 'demo_img'; Match = 'image-9.';     Dest = 'assets/screenshots/original/case-detail-concept.jpeg' }
)

$copied = 0
$missing = @()

foreach ($entry in $map) {
    $searchDir = Join-Path $SourceRoot $entry.Dir
    $dest = Join-Path $projectRoot $entry.Dest

    $match = Get-ChildItem -LiteralPath $searchDir -File -ErrorAction SilentlyContinue |
             Where-Object { $_.Name -like "*$($entry.Match)*" } |
             Select-Object -First 1

    if ($null -eq $match) {
        $missing += $entry.Match
        continue
    }

    $destDir = Split-Path -Parent $dest
    if (-not (Test-Path -LiteralPath $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }

    Copy-Item -LiteralPath $match.FullName -Destination $dest -Force
    $copied++
}

Write-Host "Copied $copied asset(s)."
if ($missing.Count -gt 0) {
    Write-Host "Not found ($($missing.Count)):"
    $missing | ForEach-Object { Write-Host "  - $_" }
}
