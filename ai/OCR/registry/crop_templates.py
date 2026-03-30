# registry/crop_templates.py
# 템플릿 문서의 크롭 영역 관리

CROP_TEMPLATES = {
    "RESIDENT_REGISTRATION": {
      "header": [0.04, 0.02, 0.96, 0.15], #issueDate, issueNumber
      "member_table": [0.05, 0.29, 0.94, 0.7] #householdMembers
    },
    "RESIDENT_REGISTRATION_ABSTRACT": {
      "header": [0.04, 0.02, 0.96, 0.15], # issueDate, issueNumber
      "personal_info": [0.05, 0.16, 0.94, 0.2], # name, residentRegistrationNumber
      "address_info": [0.05, 0.29, 0.94, 0.7] # currentAddress, moveInDate
    },
    "FAMILY_RELATION_CERTIFICATE": {
        "header": [0.1, 0.07, 0.9, 0.15],
        "personal_info":[0.05, 0.18, 0.9, 0.28], # name, residentRegistrationNumber
        "family_info": [0.04, 0.33, 0.9, 0.6], # spouse
        "issue_info": [0.03, 0.86, 0.4, 1] # issueNumber
    },
    "HEALTH_INSURANCE_ELIGIBILITY": {
        "header": [0.15, 0.16, 0.87, 0.22], # issueNumber
        "personal_info":[0.15, 0.22, 0.87, 0.28], # name, residentRegistrationNumber
        "eligibility": [0.15, 0.31, 0.87, 0.38], # subscriberType, latestAcquisitionDate, latestLossDate
    },
    "WITHHOLDING_TAX_CERTIFICATE": {
        "header": [0.05, 0.05, 0.95, 0.18], 
        "personal_info": [0.05, 0.18, 0.95, 0.27], # name, residentRegistrationNumber
        "withholding_table": [0.05, 0.28, 0.95, 0.52], # workPeriod, annualIncomeTotal
    },
    "BUSINESS_REGISTRATION_CERTIFICATE": {
        "header": [0.06, 0.13, 0.93, 0.22], # issueNumber
        "personal_info": [0.06, 0.22, 0.93, 0.36], #businessName, businessRegistrationNumber, name, residentRegistrationNumber
        "issue_date": [0.06, 0.8, 0.93, 0.87], # issueDate
    },
    "INCOME_AMOUNT_CERTIFICATE": {
        "header": [0.05, 0.04, 0.96, 0.09], # issueNumber,  incomeYear
        "personal_info": [0.05, 0.1, 0.96, 0.15], # name, residentRegistrationNumber
        "income_info": [0.05, 0.2, 0.96, 0.27], # incomeAmount
        "issue_date": [0.05, 0.57, 0.96, 0.65], # issueDate
    },
    "VAT_TAX_BASE_CERTIFICATE": {
        "header": [0.04, 0.13, 0.93, 0.2], # issueNumber
        "personal_info": [0.04, 0.2, 0.93, 0.35], # name, residentRegistrationNumber, businessName, businessRegistrationNumber
        "tax_info": [0.04, 0.4, 0.93, 0.47], # taxableSalesAmount
        "issue_date": [0.5, 0.7, 0.93, 0.8], # issueDate
    },
    "NATIONAL_TAX_CERTIFICATE": {
        "header": [0.04, 0.1, 0.96, 0.25], # issueNumber, name, residentRegistrationNumber
        "issue_date": [0.05, 0.7, 0.95, 0.78], # issueDate
    },
    "LOCAL_TAX_CERTIFICATE": {
        "header": [0.04, 0.02, 0.96, 0.11], # issueNumber
        "personal_info": [0.05, 0.15, 0.95, 0.28], # name, residentRegistrationNumber
        "issue_date": [0.05, 0.5, 0.95, 0.58], # issueDate
    },
    "LOCAL_TAX_ITEM_CERTIFICATE": {
        "header": [0.03, 0.03, 0.97, 0.1], # issueNumber
        "personal_info": [0.03, 0.11, 0.97, 0.17], # name, residentRegistrationNumber
        "tax_info": [0.03, 0.25, 0.97, 0.6], # taxItems
        "issue_date": [0.7, 0.6, 0.97, 0.83], #issueDate
    },
    "BUILDING_REGISTER": {
        "header": [0.03, 0.07, 0.93, 0.19], # isViolationBuilding
        "building_info": [0.03, 0.19, 0.93, 0.45], # mainUsage
        "building_spec": [0.03, 0.47, 0.93, 0.77], # floorStatusList
        "issue_date": [0.7, 0.77, 0.93, 0.83],
    },
    
}