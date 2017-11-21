@REM Download an updated israel-and-palestine pbf from openstreetmap.fr
@REM and update the site's OSM database using http post request.
@REM Usage:
@REM     UpdateDB
@REM 
@REM The following programs need to be installed and included in the PATH:
@REM   wget.exe       - Windows: http://gnuwin32.sourceforge.net/packages/wget.htm
@REM   osmup.exe      - https://wiki.openstreetmap.org/wiki/Osmupdate#Download
@REM   osmconvert.exe - https://wiki.openstreetmap.org/wiki/Osmconvert#Binaries

SETLOCAL

SET WORKDIR=%~dp0\site-cache
IF NOT EXIST %WORKDIR%\. MKDIR %WORKDIR%
PUSHD %WORKDIR%

@REM Initial download, if needed
IF NOT EXIST israel-and-palestine-latest.osm.pbf (
    @REM Download latest extract
    wget.exe --no-directories --no-verbose http://download.openstreetmap.fr/extracts/asia/israel_and_palestine-latest.osm.pbf
    @REM Download and apply extract timestamp
    FOR /F "skip=2 usebackq tokens=1-3 delims=\" %%X IN (
	`wget -q -O - http://download.openstreetmap.fr/extracts/asia/israel_and_palestine.state.txt`
    ) DO (
	osmconvert.exe --%%X%%Y%%Z israel_and_palestine-latest.osm.pbf -o=israel-and-palestine-latest.osm.pbf
    )
    DEL israel_and_palestine-latest.osm.pbf
)

@REM Download updates
IF EXIST israel-and-palestine-updated.osm.pbf DEL israel-and-palestine-updated.osm.pbf
osmup.exe israel-and-palestine-latest.osm.pbf israel-and-palestine-updated.osm.pbf --base-url=http://download.openstreetmap.fr/replication/asia/israel_and_palestine --minute

IF NOT ERRORLEVEL 1 (
    @REM Got new data
    DEL israel-and-palestine-latest.osm.pbf
    RENAME israel-and-palestine-updated.osm.pbf israel-and-palestine-latest.osm.pbf

    @REM Notify server
    curl -X POST https://israelhiking.osm.org.il/api/update/
)

POPD
