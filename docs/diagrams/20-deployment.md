# Deployment Architecture

```mermaid
flowchart LR
DEV[Developer]-->CI[CI Build]
CI-->SIGN[Code Signing]
SIGN-->PKG[Installer]
PKG-->REL[Release]
REL-->UPD[Auto Update]
UPD-->USER[Users]
```
