; ============================================================
;  PHARMASOFT - Installeur unique (Inno Setup)
;  Embarque : l'application + Node.js + PostgreSQL (portable)
;  Resultat : un seul .exe a double-cliquer sur le serveur.
; ============================================================

#define MyAppName "PHARMASOFT"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "TECHCARE IT Solutions"
#define Bundle "C:\PHARMASOFT-BUILD\bundle"
#define Assets "C:\Users\hp\Desktop\DEVELOPPEMENT\PHARMASOFT\pharmasoft-djibouti\installer"

[Setup]
AppId={{8F3C2A10-PHAR-4D2E-9C7B-PHARMASOFTDJ}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=C:\PHARMASOFT
DisableProgramGroupPage=yes
DefaultGroupName={#MyAppName}
OutputDir=C:\PHARMASOFT-BUILD\out
OutputBaseFilename=PHARMASOFT-Setup
SetupIconFile={#Bundle}\app\public\pharmasoft.ico
UninstallDisplayIcon={app}\app\public\pharmasoft.ico
Compression=lzma2/max
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
WizardStyle=modern
DiskSpanning=no

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Files]
; --- Application (Next.js + node_modules + build .next) ---
Source: "{#Bundle}\app\*";  DestDir: "{app}\app";    Flags: recursesubdirs createallsubdirs ignoreversion
; --- Node.js embarque ---
Source: "{#Bundle}\node\*"; DestDir: "{app}\node";   Flags: recursesubdirs createallsubdirs ignoreversion
; --- PostgreSQL portable (bin + lib + share) ---
Source: "{#Bundle}\pg\*";   DestDir: "{app}\pgsql";  Flags: recursesubdirs createallsubdirs ignoreversion
; --- Runtime Windows (securite) ---
Source: "{#Bundle}\vc_redist.x64.exe"; DestDir: "{app}"; Flags: ignoreversion
; --- Scripts d'installation / lancement ---
Source: "{#Assets}\first-run-setup.ps1";   DestDir: "{app}"; Flags: ignoreversion
Source: "{#Assets}\uninstall-cleanup.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#Assets}\run-server.cmd";        DestDir: "{app}"; Flags: ignoreversion
Source: "{#Assets}\Ouvrir-PHARMASOFT.cmd"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{commondesktop}\PHARMASOFT"; Filename: "{app}\Ouvrir-PHARMASOFT.cmd"; IconFilename: "{app}\app\public\pharmasoft.ico"; Comment: "Ouvrir PHARMASOFT"
Name: "{group}\PHARMASOFT";          Filename: "{app}\Ouvrir-PHARMASOFT.cmd"; IconFilename: "{app}\app\public\pharmasoft.ico"
Name: "{group}\Desinstaller PHARMASOFT"; Filename: "{uninstallexe}"

[Run]
; 1) Runtime Windows (rapide si deja present)
Filename: "{app}\vc_redist.x64.exe"; Parameters: "/install /quiet /norestart"; StatusMsg: "Installation des composants Windows requis..."; Flags: waituntilterminated
; 2) Configuration : base PostgreSQL, service, migrations, seed, demarrage auto, pare-feu
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\first-run-setup.ps1"" -AppDir ""{app}"" -Port 3000"; StatusMsg: "Configuration de PHARMASOFT (base de donnees, service, demarrage auto)..."; Flags: waituntilterminated runhidden
; 3) Ouvrir l'application a la fin
Filename: "{app}\Ouvrir-PHARMASOFT.cmd"; Description: "Ouvrir PHARMASOFT maintenant"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\uninstall-cleanup.ps1"" -AppDir ""{app}"" -Port 3000"; Flags: waituntilterminated runhidden; RunOnceId: "PharmasoftCleanup"

[Messages]
french.WelcomeLabel2=Cet assistant va installer [name/ver] sur ce serveur.%n%nTout est inclus (application, Node.js, base de donnees PostgreSQL) : aucune connexion internet n'est requise.
