from django.db import migrations, models


def normalize_user_roles(apps, schema_editor):
    User = apps.get_model("users", "User")

    # Map legacy role values to the new canonical values.
    mapping = {
        "etudiant": "USER",
        "candidat": "USER",
        "correcteur": "STAFF",
        "admin": "ADMIN",
        "": "USER",
        None: "USER",
    }

    for old_value, new_value in mapping.items():
        User.objects.filter(role=old_value).update(role=new_value)


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_user_role"),
    ]

    operations = [
        migrations.RunPython(normalize_user_roles, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[("USER", "User"), ("STAFF", "Staff"), ("ADMIN", "Admin")],
                default="USER",
                max_length=20,
            ),
        ),
    ]
