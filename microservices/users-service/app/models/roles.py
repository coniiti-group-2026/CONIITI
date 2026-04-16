from enum import Enum

class UserRole(str, Enum):
    EXTERNAL = "external"
    UNIVERSITY_COMMUNITY = "university_community"
    STAFF = "staff"
    SUPERUSER = "superuser"
